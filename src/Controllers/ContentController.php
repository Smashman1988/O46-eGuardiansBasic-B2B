<?php
namespace GuardiansBasicB2B\Controllers;

use Plenty\Plugin\Controller;
use Plenty\Plugin\Templates\Twig;
use IO\Services\ItemService;
use GuardiansBasicB2B\Extensions\Base_Extension;
use Plenty\Plugin\Http\Request;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\VariationAttributeMap;
use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;

class ContentController extends Controller
{
    /**
     * @var ItemService
     */
    private $itemService;
    
    public function __construct(ItemService $itemService )
    {
        parent::__construct();
        $this->itemService = $itemService;
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
    public function dynamicCatPreviewImages(Twig $twig):string
    {
        $templateData = array(
            'sItemId' => $_GET["itemid"]
        );
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicCatPreviewImages',  $templateData));
        return json_encode($arrayData);
    }  
    private function getItemData($itemId){
        $options = array(
            "itemId" => $itemId,
            "afterKey" => null
        );
        $searchfactory = VariationAttributeMap::getSearchFactory( $options );
        //$searchfactory->setPage(1, $maxItems); // Begrenze auf 4 Artikel
        $result = pluginApp(ItemSearchService::class)->getResult($searchfactory);
        return $result;
    }
    public function dynamicGetFeedbacks(Twig $twig):string
    {
        /*$templateData = array(
            'itemId' => $_GET["itemId"],
            'page' => $_GET["page"],
            'maxcount' => $_GET["maxcount"],
            'isAjaxCall' => true,
            'feedbacksData' => null
        );*/
        /** @var FeedbackAverageRepositoryContract $FeedbackAverageRepositoryContract */
        $Base_Extension = pluginApp(Base_Extension::class);
        $feedbackItems = $Base_Extension->getFeedbackItemList($_GET["itemId"],$_GET["page"],$_GET["maxcount"]);
        $templateData = array(
            'feedbackItems' => $feedbackItems
        );
        
        $arrayData = array("data" => $twig->render('GuardiansBasicB2B::DynamicContent.DynamicFeedbacks',  $templateData));
        return json_encode($arrayData);
    }
    public function getShopBuilderContent(Twig $twig):string
    {
        $templateData = array(
            'categoryId' => $_GET["categoryId"]
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
