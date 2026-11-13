<?php
namespace GuardiansBasicB2B\Controllers;

use Plenty\Plugin\Controller;
use Plenty\Plugin\Templates\Twig;
use GuardiansBasicB2B\Extensions\Base_Extension;
use GuardiansBasicB2B\Helper\SeoPage;
use Plenty\Plugin\Http\Request;

class ContentController extends Controller
{
    /** Reject malformed query values before they reach Twig or a repository. */
    private function queryInteger(Request $request, string $key, int $maximum, $default = null)
    {
        $value = SeoPage::positiveInteger($request->query($key, $default));
        return $value !== null && $value <= $maximum ? $value : null;
    }

    private function invalidParameters(): string
    {
        // Preserve the HTML-fragment envelope expected by the existing callers.
        return json_encode(['data' => '', 'error' => 'invalid_parameters']);
    }
    public function dynamicLogin(Twig $twig):string
    {
        $templateData = array(
            'currentItems' => ""
        );
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicLogin',  $templateData));
        return json_encode($arrayData);//$twig->render('GuardiansBasicB2B::DynamicContent.DynamicLogin',  $templateData);
    } 
    public function dynamicBasketPreview(Twig $twig):string
    {
        $templateData = array(
            'currentItems' => ""
        );
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicBasketPreview',  $templateData));
        return json_encode($arrayData);
    } 
    public function dynamicBasketPreviewSmall(Twig $twig):string
    {
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicBasketPreviewSmall'));
        return json_encode($arrayData);
    } 
    public function dynamicCatPreviewImages(Twig $twig, Request $request):string
    {
        $itemId = $this->queryInteger($request, 'itemid', PHP_INT_MAX);
        if ($itemId === null) {
            return $this->invalidParameters();
        }
        $templateData = array(
            'sItemId' => $itemId
        );
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicCatPreviewImages',  $templateData));
        return json_encode($arrayData);
    }  
    public function dynamicGetFeedbacks(Twig $twig, Request $request):string
    {
        $itemId = $this->queryInteger($request, 'itemId', PHP_INT_MAX);
        $page = $this->queryInteger($request, 'page', 10000, 1);
        $maxCount = $this->queryInteger($request, 'maxcount', 100, 20);
        if ($itemId === null || $page === null || $maxCount === null) {
            return $this->invalidParameters();
        }
        $Base_Extension = pluginApp(Base_Extension::class);
        $feedbackItems = $Base_Extension->getFeedbackItemList($itemId, $page, $maxCount);
        $templateData = array(
            'feedbackItems' => $feedbackItems
        );
        
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicFeedbacks',  $templateData));
        return json_encode($arrayData);
    }
    public function getShopBuilderContent(Twig $twig, Request $request):string
    {
        $categoryId = $this->queryInteger($request, 'categoryId', PHP_INT_MAX);
        if ($categoryId === null) {
            return $this->invalidParameters();
        }
        $templateData = array(
            'categoryId' => $categoryId
        );
        $response = $twig->render('GuardiansBasicB2B::DynamicContent.DynamicRestTemplate', $templateData);
        $htmlClean = preg_replace('#<script2(.*?)>(.*?)</script2>#is', '', $response);
        $arrayData = array("data" => $htmlClean);
        
        return json_encode($arrayData);
    } 
    public function getTrackings(Twig $twig):string
    {
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::PageDesign.Components.Trackings'));
        return json_encode($arrayData);
    }
}
