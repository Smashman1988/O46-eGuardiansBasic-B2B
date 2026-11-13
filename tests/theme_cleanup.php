<?php
// php tests/theme_cleanup.php <Twig autoloader> <before-dir> <after-dir> <report.json>
// Runs real helper/controller implementations and real card/feedback Twig with
// explicit dependency fixtures. This does not measure native PlentyONE queries.
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Plugin\Templates\Factories { class TwigFactory {} }
namespace Plenty\Plugin { class Controller { public function __construct() {} } }
namespace Plenty\Plugin\Http {
    class Request {
        public $params = [];
        public function get($key, $default = null) { return $this->params[$key] ?? $default; }
        public function query($key, $default = null) { return array_key_exists($key, $this->params) ? $this->params[$key] : $default; }
    }
}
namespace Plenty\Plugin\Templates {
    class Twig {
        public $environment, $calls = [];
        public function render($name, $params = []) { $this->calls[] = [$name, $params]; return $this->environment->render($name, $params); }
    }
}
namespace IO\Services {
    class ItemService {}
    class CategoryService {
        public $calls = [], $current = ['id' => 987, 'name' => 'Routed category'];
        public function get($id) { $this->calls[] = $id; return ['id' => $id, 'name' => 'Unused source category']; }
    }
}
namespace Ceres\Helper {
    class SearchOptions {
        const SCOPE_CATEGORY = 'category';
        public static function validateItemListOptions($options, $scope) {
            if ($options['itemsPerPage'] < 1) { throw new \InvalidArgumentException('Invalid page size'); }
            return $options;
        }
    }
}
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class CategoryItems { public static function getSearchFactory($options) { return ['category' => $options]; } }
    class VariationAttributeMap { public static function getSearchFactory($options) { return ['attribute' => $options]; } }
}
namespace Plenty\Modules\Webshop\ItemSearch\Services {
    class ItemSearchService {
        public $documents = [], $calls = [], $fail = false;
        public function getResults($factories) {
            if ($this->fail) { throw new \RuntimeException('Search unavailable'); }
            $this->calls[] = $factories;
            if (isset($factories['itemList'])) { return ['itemList' => ['documents' => $this->documents]]; }
            return array_map(function () { return ['attributes' => []]; }, $factories);
        }
    }
}
namespace Plenty\Modules\Feedback\Contracts {
    class FeedbackRepositoryContract {
        public $data, $calls = [], $fail = false;
        public function listFeedbacks(...$args) {
            $this->calls[] = $args;
            if ($this->fail) { throw new \RuntimeException('Feedback unavailable'); }
            return $this->data === null ? null : new \CleanupData($this->data);
        }
    }
}
namespace {
$deprecations = [];
set_error_handler(function ($level, $message, $file, $line) use (&$deprecations) {
    if ($level === E_DEPRECATED || $level === E_USER_DEPRECATED) {
        // Preserve dependency diagnostics outside the rendered HTML comparison.
        $deprecations[] = ['message'=>$message,'file'=>$file,'line'=>$line];
        return true;
    }
    throw new \ErrorException($message, 0, $level, $file, $line);
});
require $argv[1];
require_once dirname(__DIR__) . '/src/Helper/SeoPage.php';
class CleanupData { private $data; public function __construct($data) { $this->data = $data; } public function toArray() { return $this->data; } }
class CleanupCallback { private $fn; public function __construct($fn) { $this->fn = $fn; } public function call(...$args) { return ($this->fn)(...$args); } }
function cb($fn) { return [new CleanupCallback($fn), 'call']; }
function pluginApp($class, $params = []) {
    $GLOBALS['resolutions'][] = $class;
    if (!isset($GLOBALS['services'][$class])) { throw new \RuntimeException('Unexpected dependency: ' . $class); }
    return $GLOBALS['services'][$class];
}
$root = dirname(__DIR__);
$rows = []; $assertions = 0;
function check($ok, $message) { $GLOBALS['assertions']++; if (!$ok) { throw new \RuntimeException($message); } }
foreach (['Before' => $argv[2], 'After' => $argv[3]] as $version => $dir) {
    foreach (['Base_Extension', 'ContentController'] as $class) {
        $source = file_get_contents($dir . '/' . $class . '.php');
        $source = str_replace('class ' . $class . ' ', 'class Cleanup' . $version . $class . ' ', $source);
        eval(substr($source, 5));
    }
}
$templates = [];
foreach (['Category.Item.Partials.CategoryGridOnly', 'Category.Item.Partials.CategoryListItem', 'Category.Item.Partials.CategoryAttributes', 'Category.Macros.render-rating', 'DynamicContent.DynamicFeedbacks'] as $name) {
    $templates['GuardiansBasicB2B::' . $name] = file_get_contents($root . '/resources/views/' . str_replace('.', '/', $name) . '.twig');
}
foreach (['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName'] as $name) { $templates[$name] = ''; }
foreach (['de','en','fr','it','es'] as $lang) foreach ([false,true] as $customer) foreach ([0,1,24,48] as $count) foreach ([[],['priceMin'=>2,'priceMax'=>9],['priceMin'=>9,'priceMax'=>2,'page'=>2]] as $query) {
    $results = [];
    foreach (['Before','After'] as $version) {
        $category = new \IO\Services\CategoryService(); $search = new \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService();
        $request = new \Plenty\Plugin\Http\Request(); $request->params = $query;
        for ($i=1; $i<=$count; $i++) { $search->documents[] = ['data'=>['item'=>['id'=>$i,'flagTwo'=>0,'manufacturer'=>['name'=>'Fixture','logo'=>'']],'variation'=>['id'=>$i+100,'itemId'=>$i], 'images'=>['all'=>[['urlPreview'=>'/fixture-'.$i.'.jpg']]],'prices'=>['default'=>['unitPrice'=>['value'=>$customer ? 4.123456 : 5.987654,'formatted'=>$customer ? '4,12 EUR' : '5,99 EUR']],'rrp'=>['unitPrice'=>['value'=>10,'formatted'=>'10,00 EUR']]]]]; }
        $renderer = new \Plenty\Plugin\Templates\Twig(); $renderer->environment = new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates));
        $class = 'GuardiansBasicB2B\\Extensions\\Cleanup' . $version . 'Base_Extension';
        $extension = new $class(new \Plenty\Plugin\Templates\Factories\TwigFactory(),$renderer,$request);
        $GLOBALS['services'] = [\IO\Services\CategoryService::class=>$category,\Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService::class=>$search]; $GLOBALS['resolutions'] = [];
        $twig = $renderer->environment;
        $twig->addFunction(new \Twig\TwigFunction('getCardAttributeMaps',[$extension,'getCardAttributeMaps']));
        $twig->addFunction(new \Twig\TwigFunction('getAttributesWithImages',cb(function () { throw new \RuntimeException('Unexpected per-card fallback'); })));
        $twig->addFunction(new \Twig\TwigFunction('trans',cb(function ($key) use ($lang) { return $lang . ':' . $key; })));
        $twig->addFunction(new \Twig\TwigFunction('plugin_path',cb(function () { return '/theme'; })));
        $twig->addFilter(new \Twig\TwigFilter('itemURL',cb(function ($data) use ($lang) { return '/'.$lang.'/product/'.$data['item']['id']; })));
        $twig->addFilter(new \Twig\TwigFilter('itemName',cb(function ($data) use ($lang) { return $lang.' item '.$data['item']['id']; })));
        $twig->addFilter(new \Twig\TwigFilter('orderByKey',cb(function ($data) { return $data; })));
        $html = $extension->getItemsFromCatSimple(42,48,[5],[1,10]);
        $results[$version] = ['html'=>$html,'search'=>$search->calls,'renders'=>$renderer->calls,'category'=>$category->calls,'current'=>$category->current];
    }
    check($results['Before']['html'] === $results['After']['html'],'Changed card HTML');
    check($results['Before']['search'] === $results['After']['search'],'Changed search/filter/batching options');
    check($results['Before']['renders'] === $results['After']['renders'],'Changed rendering context');
    check($results['Before']['current'] === $results['After']['current'],'Changed routed category');
    check($results['Before']['category'] === [42] && $results['After']['category'] === [],'Expected one eliminated category getter');
    $rows[] = ['area'=>'simple-list','lang'=>$lang,'customerFixture'=>$customer,'items'=>$count,'query'=>$query,'htmlSha256'=>hash('sha256',$results['After']['html']),'categoryCallsBefore'=>1,'categoryCallsAfter'=>0];
}
foreach (['de','en','fr','it','es'] as $lang) foreach ([null,[],[true,false],[true,true,true]] as $visible) {
    $results = [];
    foreach (['Before','After'] as $version) {
        $repo = new \Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract();
        $repo->data = $visible === null ? null : ['entries'=>array_map(function ($v) { return ['isVisible'=>$v?'true':'false','feedbackRating'=>['rating'=>['ratingValue'=>5]],'targetRelation'=>['targetRelationName'=>['Size']],'sourceRelation'=>[['sourceRelationLabel'=>'Test Person']],'feedbackComment'=>['comment'=>['message'=>'Test & <example>']],'updatedAt'=>'2026-11-12','createdAt'=>'2026-11-11','title'=>'Fixture']; },$visible)];
        $renderer = new \Plenty\Plugin\Templates\Twig(); $renderer->environment = new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates));
        $renderer->environment->addFunction(new \Twig\TwigFunction('trans',cb(function ($key) use ($lang) { return $lang.':'.$key; })));
        $extClass = 'GuardiansBasicB2B\\Extensions\\Cleanup'.$version.'Base_Extension';
        $extension = new $extClass(new \Plenty\Plugin\Templates\Factories\TwigFactory(),$renderer,new \Plenty\Plugin\Http\Request());
        $GLOBALS['services'] = ['GuardiansBasicB2B\\Extensions\\Base_Extension'=>$extension,\Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract::class=>$repo]; $GLOBALS['resolutions'] = [];
        $class = 'GuardiansBasicB2B\\Controllers\\Cleanup'.$version.'ContentController'; $controller = new $class(new \IO\Services\ItemService());
        $_GET = ['itemId'=>'42','page'=>'2','maxcount'=>'20'];
        $request = new \Plenty\Plugin\Http\Request(); $request->params = $_GET;
        $json = $controller->dynamicGetFeedbacks($renderer, $request);
        $results[$version] = ['json'=>$json,'queries'=>$repo->calls,'renders'=>$renderer->calls,'resolutions'=>array_count_values($GLOBALS['resolutions'])];
    }
    check($results['Before']['json'] === $results['After']['json'],'Changed feedback JSON/HTML');
    check($results['Before']['queries'] === [['2','20',[],['itemId'=>'42','ratingValue'=>5]]], 'Historical feedback query contract');
    check($results['After']['queries'] === [[2,20,[],['itemId'=>42,'ratingValue'=>5]]], 'Validated feedback query retains values');
    check($results['Before']['renders'] === $results['After']['renders'],'Changed feedback template data');
    $key = \Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract::class;
    check($results['Before']['resolutions'][$key] === 2 && $results['After']['resolutions'][$key] === 1,'Expected one eliminated container resolution');
    $rows[] = ['area'=>'feedback','lang'=>$lang,'entries'=>$visible,'jsonSha256'=>hash('sha256',$results['After']['json']),'repositoryQueries'=>1,'resolutionsBefore'=>2,'resolutionsAfter'=>1];
}
// Search validation and upstream failures are still propagated.
foreach (['Before','After'] as $version) foreach (['validation','search','feedback'] as $failure) {
    $search = new \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService(); $search->fail = $failure === 'search';
    $repo = new \Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract(); $repo->fail = true;
    $renderer = new \Plenty\Plugin\Templates\Twig(); $class = 'GuardiansBasicB2B\\Extensions\\Cleanup'.$version.'Base_Extension';
    $extension = new $class(new \Plenty\Plugin\Templates\Factories\TwigFactory(),$renderer,new \Plenty\Plugin\Http\Request());
    $GLOBALS['services'] = [\IO\Services\CategoryService::class=>new \IO\Services\CategoryService(),\Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService::class=>$search,\Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract::class=>$repo,'GuardiansBasicB2B\\Extensions\\Base_Extension'=>$extension];
    $request = new \Plenty\Plugin\Http\Request(); $request->params = $_GET;
    try { if ($failure === 'feedback') { $class='GuardiansBasicB2B\\Controllers\\Cleanup'.$version.'ContentController'; (new $class(new \IO\Services\ItemService()))->dynamicGetFeedbacks($renderer, $request); } else { $extension->getItemsFromCatSimple(42,$failure==='validation'?0:24,[]); } throw new \LogicException('Failure swallowed'); }
    catch (\RuntimeException|\InvalidArgumentException $e) { check($e->getMessage() === ['validation'=>'Invalid page size','search'=>'Search unavailable','feedback'=>'Feedback unavailable'][$failure],'Wrong upstream failure'); }
}
file_put_contents($argv[4],json_encode(['twig'=>\Twig\Environment::VERSION,'mode'=>'LOCAL_REAL_PHP_TWIG_WITH_EXPLICIT_SERVICE_FIXTURES','assertions'=>$assertions,'comparisons'=>$rows,'errorPropagationCases'=>6,'dependencyDeprecations'=>$deprecations],JSON_PRETTY_PRINT));
echo count($rows).' comparisons / '.$assertions.' assertions PASS; native server savings not measured.'.PHP_EOL;
}
