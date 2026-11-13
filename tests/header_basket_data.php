<?php
// Execute the actual available IO BasketService/CouponService against explicit repositories.
// php tests/header_basket_data.php <IO reference root> <report.json>
namespace Plenty\Plugin\Log { trait Loggable {} }
namespace IO\Helper { class Utils { static function getPlentyId(){return 1;} } }
namespace Plenty\Modules\Basket\Models { class Basket {
    public $currency='EUR',$data=[];function toArray(){ $GLOBALS['basketCalls'][]='basket.toArray';return array_merge($this->data,['currency'=>$this->currency]); }
} }
namespace Plenty\Modules\Order\Coupon\Campaign\Models { class CouponCampaign { const COUPON_TYPE_SALES='sales';public $couponType='sales'; } }
namespace {
function pluginApp($name){$GLOBALS['basketCalls'][]='resolve:'.$name;if(!isset($GLOBALS['basketServices'][$name]))throw new RuntimeException('Unexpected service '.$name);return $GLOBALS['basketServices'][$name];}
function field($object,$name,$value){$p=new ReflectionProperty($object,$name);$p->setValue($object,$value);}
require $argv[1].'/src/Services/BasketService.php';require $argv[1].'/src/Services/CouponService.php';
$report=[];
foreach([false,true]as$loaded)foreach([0,9,9.5,10,25]as$quantity)foreach([false,true]as$coupon)foreach([false,true]as$net){$pair=[];foreach(['full','quantity']as$mode){
 $GLOBALS['basketCalls']=[];
 $service=(new ReflectionClass(\IO\Services\BasketService::class))->newInstanceWithoutConstructor();
 $basket=new \Plenty\Modules\Basket\Models\Basket();$basket->data=['itemSum'=>100,'itemSumNet'=>80,'basketAmount'=>110,'basketAmountNet'=>88,'shippingAmount'=>10,'shippingAmountNet'=>8,'shippingCountryId'=>1,'couponCode'=>$coupon?'TEST':'','couponDiscount'=>5];
 $basketRepo=new class($basket){private $basket;function __construct($b){$this->basket=$b;}function load(){$GLOBALS['basketCalls'][]='basket.load';return $this->basket;}function getTaxFreeAmount(...$args){$GLOBALS['basketCalls'][]='basket.taxFreeAmount';return 0;}};
 $items=new class($quantity){private $qty;function __construct($q){$this->qty=$q;}function getBasketItemQuantity(){$GLOBALS['basketCalls'][]='items.quantity';return $this->qty;}function all(){throw new RuntimeException('Unexpected basket items load');}};
 $campaignRepo=new class {function findByCouponCode($code){$GLOBALS['basketCalls'][]='coupon.find';return new \Plenty\Modules\Order\Coupon\Campaign\Models\CouponCampaign();}};
 $couponService=(new ReflectionClass(\IO\Services\CouponService::class))->newInstanceWithoutConstructor();field($couponService,'couponCampaignRepository',$campaignRepo);
 $order=(object)['isNet'=>$net,'couponCodeValidation'=>null];
 $session=new class($order){private $order;function __construct($o){$this->order=$o;}function getOrder(){$GLOBALS['basketCalls'][]='session.order';return $this->order;}};
 $config=new class {function getWebstoreConfiguration(){$GLOBALS['basketCalls'][]='config';return(object)['useVariationOrderProperties'=>true];}};
 field($service,'basketItemRepository',$items);field($service,'couponService',$couponService);field($service,'sessionStorageRepository',$session);field($service,'webstoreConfigurationRepository',$config);
 field($service,'vatService',new class {function getCurrentTotalVats(){$GLOBALS['basketCalls'][]='vat';return [];}});
 if($loaded)field($service,'basketItems',[(object)['variationId'=>123,'quantity'=>$quantity],(object)['variationId'=>0,'quantity'=>999]]);
 $GLOBALS['basketServices']=[
  'Plenty\\Modules\\Basket\\Contracts\\BasketRepositoryContract'=>$basketRepo,
  'Plenty\\Modules\\Webshop\\Contracts\\CheckoutRepositoryContract'=>new class {function getCurrency(){$GLOBALS['basketCalls'][]='checkout.currency';return'EUR';}},
  'Plenty\\Modules\\Order\\Shipping\\Contracts\\EUCountryCodesServiceContract'=>new class {function isExportDelivery($c){$GLOBALS['basketCalls'][]='export';return false;}},
  'Plenty\\Modules\\Accounting\\Contracts\\DetermineShopCountryContract'=>new class {function initByPlentyId($id){$GLOBALS['basketCalls'][]='country.init';}function getCountryId(){$GLOBALS['basketCalls'][]='country.id';return 1;}},
  'IO\\Services\\ItemWishListService'=>new class {function getItemWishList(){$GLOBALS['basketCalls'][]='wishlist';return [];}}
 ];
 $value=$mode==='full'?$service->getBasketForTemplate()['itemQuantity']:$service->getBasketQuantity();
 $pair[$mode]=['value'=>$value,'calls'=>$GLOBALS['basketCalls']];
 }if($pair['full']['value']!==$pair['quantity']['value']||$pair['quantity']['value']!==$quantity)throw new RuntimeException('Quantity changed');
 if($pair['quantity']['calls']!==($loaded?[]:['items.quantity']))throw new RuntimeException('Unexpected work in quantity getter');
 $report[]=['loadedItems'=>$loaded,'quantity'=>$quantity,'coupon'=>$coupon,'net'=>$net,'before'=>$pair['full'],'after'=>$pair['quantity'],'status'=>'PASS'];
}
$effects=[];
foreach([[false,false],[true,false],[false,true]]as[$net,$showNet]){
    $service=(new ReflectionClass(\IO\Services\BasketService::class))->newInstanceWithoutConstructor();
    field($service,'sessionStorageRepository',new class($net){private $net;function __construct($n){$this->net=$n;}function getOrder(){return(object)['isNet'=>$this->net];}});
    field($service,'contactRepository',new class($showNet){private $net;function __construct($n){$this->net=$n;}function showNetPrices(){return $this->net;}});
    $item=new class {public $price=119.0,$vat=19,$variationId=1,$basketItemOrderParams=[];function toArray(){return ['price'=>$this->price];}};
    $method=new ReflectionMethod(\IO\Services\BasketService::class,'addVariationData');
    $oldItem=clone $item;$newItem=clone $item;
    // With useVariationOrderProperties=false, the full header getter reaches this
    // real IO transformation through getSubAmount -> getBasketItems. A later
    // getBasketItems consumer runs it again against the same request objects.
    $method->invoke($service,[$oldItem],[]);
    $oldLater=$method->invoke($service,[$oldItem],[]);
    $newLater=$method->invoke($service,[$newItem],[]);
    $equal=$oldLater===$newLater;
    if($equal!==(!$net&&!$showNet))throw new RuntimeException('Expected IO request-object price side effect not reproduced');
    $effects[]=['orderIsNet'=>$net,'customerShowNet'=>$showNet,'beforeHeaderThenConsumer'=>$oldLater[0]['price'],'quantityOnlyThenConsumer'=>$newLater[0]['price'],'equal'=>$equal];
}
$header=file_get_contents(dirname(__DIR__).'/resources/views/PageDesign/Partials/Header/Header.twig');
if(strpos($header,'services.basket.getBasketForTemplate()')===false||strpos($header,'services.basket.getBasketQuantity()')!==false)throw new RuntimeException('Do not remove full getter before resolving request-object price side effects');
file_put_contents($argv[2],json_encode(['status'=>'PASS','decision'=>'REJECT_HEADER_QUANTITY_OPTIMIZATION','scope'=>'Actual available IO source, explicit repositories; no native SQL timing or authenticated acceptance','cases'=>$report,'requestObjectSideEffects'=>$effects],JSON_PRETTY_PRINT));echo count($report)." quantity equivalence cases and 3 real IO price-side-effect probes PASS; header optimization rejected\n";
}
