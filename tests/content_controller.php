<?php
// Local controller contracts with recording platform doubles; no Plenty requests.
// php tests/content_controller.php [report.json]
namespace Plenty\Plugin { class Controller { public function __construct() {} } }
namespace Plenty\Plugin\Http {
    class Request {
        public $values;
        public function __construct(array $values = []) { $this->values = $values; }
        public function query($key, $default = null) {
            return array_key_exists($key, $this->values) ? $this->values[$key] : $default;
        }
    }
}
namespace Plenty\Plugin\Templates {
    class Twig {
        public $calls = [], $fail = false;
        public function render($template, $params = []) {
            $this->calls[] = [$template, $params];
            if ($this->fail) { throw new \RuntimeException('Template unavailable'); }
            return '<p>fragment</p><script2>excluded()</script2><script>retained()</script>';
        }
    }
}
namespace GuardiansBasicB2B\Extensions {
    class Base_Extension {
        public $calls = [], $fail = false;
        public function getFeedbackItemList($id, $page, $count) {
            $this->calls[] = [$id, $page, $count];
            if ($this->fail) { throw new \RuntimeException('Feedback unavailable'); }
            return ['entries' => [['id' => 123]], 'page' => $page];
        }
    }
}
namespace {
    set_error_handler(function ($level, $message, $file, $line) {
        throw new \ErrorException($message, 0, $level, $file, $line);
    });
    require dirname(__DIR__) . '/src/Helper/SeoPage.php';
    require dirname(__DIR__) . '/src/Controllers/ContentController.php';
    $assertions = 0; $cases = []; $resolutions = [];
    $extension = new \GuardiansBasicB2B\Extensions\Base_Extension();
    function pluginApp($class) {
        $GLOBALS['resolutions'][] = $class;
        if ($class !== \GuardiansBasicB2B\Extensions\Base_Extension::class) { throw new \RuntimeException('Unexpected service ' . $class); }
        return $GLOBALS['extension'];
    }
    function check($ok, $message) {
        $GLOBALS['assertions']++;
        if (!$ok) { throw new \RuntimeException($message); }
    }
    $controller = new \GuardiansBasicB2B\Controllers\ContentController();
    // Conflicting superglobal input must never supply request parameters.
    $_GET = ['itemId' => '999', 'itemid' => '999', 'categoryId' => '999', 'page' => '-1', 'maxcount' => '999999'];
    $valid = [
        ['dynamicCatPreviewImages', ['itemid'=>'42'], ['sItemId'=>42], null],
        ['dynamicCatPreviewImages', ['itemid'=>2147483647], ['sItemId'=>2147483647], null],
        ['dynamicCatPreviewImages', ['itemid'=>(string)PHP_INT_MAX], ['sItemId'=>PHP_INT_MAX], null],
        ['getShopBuilderContent', ['categoryId'=>'5638'], ['categoryId'=>5638], null],
        ['getShopBuilderContent', ['categoryId'=>'5640'], ['categoryId'=>5640], null],
        ['dynamicGetFeedbacks', ['itemId'=>'42','page'=>'2','maxcount'=>'20'], null, [42,2,20]],
        ['dynamicGetFeedbacks', ['itemId'=>42], null, [42,1,20]],
        ['dynamicGetFeedbacks', ['itemId'=>'2147483647','page'=>'10000','maxcount'=>'100'], null, [2147483647,10000,100]],
    ];
    foreach ($valid as [$method, $query, $params, $feedback]) {
        $twig = new \Plenty\Plugin\Templates\Twig(); $extension->calls = []; $resolutions = [];
        $body = json_decode($controller->$method($twig, new \Plenty\Plugin\Http\Request($query)), true, 512, JSON_THROW_ON_ERROR);
        check(array_keys($body) === ['data'] && is_string($body['data']), 'Successful response envelope');
        check(count($twig->calls) === 1, 'One fragment render');
        if ($feedback !== null) {
            check($extension->calls === [$feedback], 'Validated integer pagination reaches feedback service');
            check($twig->calls[0][1] === ['feedbackItems'=>['entries'=>[['id'=>123]],'page'=>$feedback[1]]], 'Feedback data preserved');
            check(count($resolutions) === 1, 'One feedback dependency');
        } else {
            check($twig->calls[0][1] === $params, 'Validated ID reaches template');
            check(!$resolutions, 'No unused ItemService dependency');
        }
        check((strpos($body['data'], '<script2>') === false) === ($method === 'getShopBuilderContent'), 'Existing script2 filter scope');
        check(strpos($body['data'], '<script>retained()') !== false, 'Existing script output retained');
        $cases[] = ['method'=>$method,'query'=>$query,'status'=>'PASS'];
    }
    $invalid = [null, '', '0', '-1', '1.0', '1e2', '+1', ' 1', '01', '1x', true, false, 1.5, [], ['1'], (object)['id'=>1], '999999999999999999999999'];
    foreach (['dynamicCatPreviewImages'=>'itemid', 'getShopBuilderContent'=>'categoryId', 'dynamicGetFeedbacks'=>'itemId'] as $method=>$key) {
        foreach (array_merge($invalid, [(string)PHP_INT_MAX . '0']) as $value) {
            $twig = new \Plenty\Plugin\Templates\Twig(); $extension->calls = []; $resolutions = [];
            $body = json_decode($controller->$method($twig, new \Plenty\Plugin\Http\Request([$key=>$value])), true, 512, JSON_THROW_ON_ERROR);
            check($body === ['data'=>'','error'=>'invalid_parameters'], 'Controlled invalid ID response');
            check(!$twig->calls && !$extension->calls && !$resolutions, 'Invalid ID performs no rendering or query');
            $cases[] = ['method'=>$method,'invalidField'=>$key,'value'=>$value,'status'=>'PASS'];
        }
    }
    foreach (['page'=>'10001','maxcount'=>'101'] as $key=>$overLimit) {
        foreach (array_merge($invalid, [$overLimit]) as $value) {
            $twig = new \Plenty\Plugin\Templates\Twig(); $extension->calls = []; $resolutions = [];
            $body = json_decode($controller->dynamicGetFeedbacks($twig, new \Plenty\Plugin\Http\Request(['itemId'=>'42',$key=>$value])), true, 512, JSON_THROW_ON_ERROR);
            check($body === ['data'=>'','error'=>'invalid_parameters'], 'Controlled invalid pagination response');
            check(!$twig->calls && !$extension->calls && !$resolutions, 'Invalid pagination performs no rendering or query');
            $cases[] = ['method'=>'dynamicGetFeedbacks','invalidField'=>$key,'value'=>$value,'status'=>'PASS'];
        }
    }
    foreach (['dynamicLogin','dynamicBasketPreview','dynamicBasketPreviewSmall','getTrackings'] as $method) {
        $twig = new \Plenty\Plugin\Templates\Twig(); $resolutions = [];
        $body = json_decode($controller->$method($twig), true, 512, JSON_THROW_ON_ERROR);
        check(array_keys($body) === ['data'] && count($twig->calls) === 1 && !$resolutions, 'Unchanged fragment route');
        $cases[] = ['method'=>$method,'status'=>'PASS'];
    }
    foreach (['repository','template'] as $failure) {
        $twig = new \Plenty\Plugin\Templates\Twig(); $twig->fail = $failure === 'template'; $extension->fail = $failure === 'repository';
        try {
            $controller->dynamicGetFeedbacks($twig, new \Plenty\Plugin\Http\Request(['itemId'=>'42']));
            throw new \LogicException('Unexpected swallowed dependency error');
        } catch (\RuntimeException $e) {
            check($e->getMessage() === ($failure === 'repository' ? 'Feedback unavailable' : 'Template unavailable'), 'Dependency error is not disguised as empty success');
        }
        $cases[] = ['failure'=>$failure,'status'=>'PASS'];
    }
    $report = ['mode'=>'LOCAL_PLATFORM_DOUBLES_NOT_NATIVE_ACCEPTANCE','assertions'=>$assertions,'cases'=>$cases];
    if (isset($argv[1])) { file_put_contents($argv[1], json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)); }
    echo count($cases) . " cases / $assertions assertions PASS; invalid input makes no service calls.\n";
}
