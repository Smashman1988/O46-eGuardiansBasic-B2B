<?php
// php tests/theme_bootstrap.php [provider.php]
// Reproduce the native-container boundary from the Pluginset-426 boot log.
// Plugin services are deliberately unavailable under their original PHP names.
// Their compiled names are resolved later by pluginApp, not by Application::bind.
namespace BootstrapTest {
    class Application {
        public $providers = [];
        public function bind($abstract, $concrete = null) {
            if (!class_exists($abstract)) {
                throw new \RuntimeException('class ' . $abstract . ' not found');
            }
        }
        public function register($provider) { $this->providers[$provider] = true; }
    }
    function check($condition, $message) {
        if (!$condition) { throw new \RuntimeException($message); }
        $GLOBALS['assertions']++;
    }
}
namespace Plenty\Plugin {
    class ServiceProvider {
        public function getApplication() { return $GLOBALS['application']; }
    }
    class RouteServiceProvider {}
    class ConfigRepository {
        public function get($key) {
            return 'page_design, head, header, footer, item, category_view, category_content, category_item';
        }
    }
}
namespace Plenty\Plugin\Templates {
    class Twig { public function addExtension($extension) {} }
}
namespace Plenty\Plugin\Events {
    class Dispatcher {
        public $listeners = [];
        public function listen($event, $listener, $priority = 0) { $this->listeners[$event] = $listener; }
    }
}
namespace Plenty\Plugin\Routing {
    class Router { public function get($path, $controller) {} }
    class ApiRouter {
        public $namespace, $routes = [];
        public function version($versions, $options, $callback) {
            $this->namespace = $options['namespace'];
            $callback($this);
        }
        public function resource($path, $resource) { $this->routes[$path] = $this->namespace . '\\' . $resource; }
        public function get($path, $controller) { $this->routes[$path] = $this->namespace . '\\' . $controller; }
    }
}
namespace Plenty\Modules\Webshop\Consent\Contracts {
    class ConsentRepositoryContract { public function registerConsent(...$args) {} }
}
namespace Plenty\Modules\Webshop\ItemSearch\Helpers {
    class ResultFieldTemplate {
        const TEMPLATE_LIST_ITEM = 1, TEMPLATE_SINGLE_ITEM = 2, TEMPLATE_BASKET_ITEM = 3,
            TEMPLATE_AUTOCOMPLETE_ITEM_LIST = 4, TEMPLATE_CATEGORY_TREE = 5, TEMPLATE_VARIATION_ATTRIBUTE_MAP = 6;
        public function setTemplates($templates) {}
    }
}
namespace IO\Extensions\Functions {
    class Partial {
        public $templates = [];
        public function set($name, $template) { $this->templates[$name] = $template; }
    }
}
namespace {
    function pluginApp($class) { return new $class(); }
    $assertions = 0;
    $application = new \BootstrapTest\Application();
    $root = dirname(__DIR__);
    require $argv[1] ?? $root . '/src/Providers/GuardiansBasicServiceProvider.php';
    require $root . '/src/Providers/GuardiansBasicRouteServiceProvider.php';
    $provider = new \GuardiansBasicB2B\Providers\GuardiansBasicServiceProvider();
    $provider->register();
    $events = new \Plenty\Plugin\Events\Dispatcher();
    $provider->boot(new \Plenty\Plugin\Templates\Twig(), $events, new \Plenty\Plugin\ConfigRepository());
    $partial = new \IO\Extensions\Functions\Partial();
    $events->listeners['IO.init.templates']($partial);
    foreach (['head' => 'PageDesign.Partials.Head', 'header' => 'PageDesign.Partials.Header.Header',
              'page-design' => 'PageDesign.PageDesign', 'footer' => 'PageDesign.Partials.Footer'] as $key => $template) {
        \BootstrapTest\check($partial->templates[$key] === 'GuardiansBasicB2B::' . $template, $key . ' override');
    }
    foreach (['IO.tpl.item', 'IO.tpl.category.item', 'IO.tpl.category.content'] as $event) {
        \BootstrapTest\check(isset($events->listeners[$event]), $event . ' listener');
    }
    $api = new \Plenty\Plugin\Routing\ApiRouter();
    foreach (array_keys($application->providers) as $class) {
        (new $class())->map(new \Plenty\Plugin\Routing\Router(), $api);
    }
    \BootstrapTest\check($api->routes['io/facet'] === 'GuardiansBasicB2B\\Resources\\FacetResource', 'facet route');
    if (!isset($argv[1])) {
        \BootstrapTest\check($api->routes['guardiansbasicb2b/item/search/autocomplete'] === 'GuardiansBasicB2B\\Resources\\SearchAutocompleteResource@index', 'unique autocomplete route');
        \BootstrapTest\check(!isset($api->routes['io/item/search/autocomplete']), 'native IO autocomplete route is not overridden');
    }
    echo "$assertions assertions passed; theme boot and routes preserved without native binding of plugin classes.\n";
}
