<?php
// Real Twig 2/3 before/after contracts; only the intended decorative structure differs.
// php tests/phase13_cards.php <autoload> <baseline views> <report.json>
define('O46_CARD_FIXTURE_ONLY', true);
require __DIR__.'/phase11_cards.php';
require __DIR__.'/card_markup_contract.php';
function card13Contract($html) {
    $dom=cardMarkupDocument($html);$xp=new DOMXPath($dom);$out=[];
    foreach($xp->query('//div[@data-eg-item]') as $card) {
        $row=['id'=>$card->getAttribute('data-eg-item'),'class'=>$card->getAttribute('class')];
        // Keep each actual link, action, image source, size, comparison price,
        // badge and rating exactly. Logo relocation may change global img order.
        foreach(['links'=>'.//a','buttons'=>'.//button','picture'=>'.//picture',
            'logo'=>'.//img[contains(@class,"cat-logo")]',
            'sizes'=>'.//span[contains(concat(" ",@class," ")," availsize ")]',
            'sizeLabel'=>'.//span[contains(@class,"sizebox")]',
            'sale'=>'.//span[contains(@class,"i-action-sale")]',
            'sustainability'=>'.//span[contains(@class,"i-action-nachhaltig-cat")]',
            'ratings'=>'.//span[@class="item-action2"]',
            'prices'=>'.//span[contains(@class,"bold")]'] as $key=>$query) {
            $row[$key]=[];
            foreach($xp->query($query,$card) as $el) $row[$key][]=cardMarkupContract($dom->saveHTML($el));
        }
        $out[]=$row;
    }
    return $out;
}
function card13Pair($twigs,$fixtures,$name,$ctx,$label) {
    $r=[];
    foreach(['before','after'] as $v){$fixtures[$v]->calls=[];$twigs[$v]->ratingLoads=0;$html=$twigs[$v]->render($name,$ctx);$r[$v]=['html'=>$html,'counts'=>cardMarkupCounts($html),'calls'=>$fixtures[$v]->calls,'ratingLoads'=>$twigs[$v]->ratingLoads];}
    phase11Check(card13Contract($r['before']['html'])===card13Contract($r['after']['html']),'Content/image/action contract: '.$label);
    phase11Check($r['before']['calls']===$r['after']['calls'],'Backend/helper calls: '.$label);
    phase11Check($r['before']['ratingLoads']===$r['after']['ratingLoads'],'Rating loads: '.$label);
    phase11Check(strpos($r['after']['html'],'cat-article-header-info')===false && strpos($r['after']['html'],'no-cat-at')===false,'Removed empty wrappers: '.$label);
    return $r;
}
$cards=[];$lists=[];$visual=[];$isolated=[];
foreach(['de','en','fr','it','es'] as $lang){
    $f=[];$t=[];foreach(['before','after']as$v){$f[$v]=new Phase11CardFixture($lang);$t[$v]=phase11Environment($f[$v],$v==='before',true);}
    $translations=[];foreach(['tSustainability'=>'sustainability','tAvailSizes'=>'availsizes','tStatt'=>'statt','tInBasket'=>'inbasket'] as $key=>$value)$translations[$key]=$f['after']->trans('GuardiansBasicB2B::Template.'.$value);
    foreach(['EUR','USD','X<&"']as$currency)foreach(['lazy','priority','eager','responsive768','responsive1200','macro1','macro2']as$mode)foreach(phase11Items(12,$lang)as$item){
        $ctx=['item'=>$item,'currencycheck'=>$currency,'translations'=>$translations,'transLabels'=>['availsizeonesize'=>'One size'],'isShoeCategory'=>true,'cardPriorityImage'=>$mode==='priority','cardImageMinViewport'=>$mode==='responsive768'?768:($mode==='responsive1200'?1200:null),'variant'=>$mode==='macro1'?1:2];
        $name=strpos($mode,'macro')===0?'public-macro':'GuardiansBasicB2B::Category.Item.Partials.CategoryListItem'.($mode==='eager'?'2':'');
        $r=card13Pair($t,$f,$name,$ctx,$lang.'/'.$currency.'/'.$mode);
        $cards[]=['lang'=>$lang,'currency'=>$currency,'mode'=>$mode,'before'=>$r['before']['counts'],'after'=>$r['after']['counts']];
    }
    // A custom empty logo base must retain the original raw-logo fallback.
    $edge=phase11Items(2,$lang)[1];$edge['data']['item']['manufacturer']['logo']='https://cdn02.outlet46.de/frontend/vendor/';
    card13Pair($t,$f,'GuardiansBasicB2B::Category.Item.Partials.CategoryListItem',['item'=>$edge,'cardVendorLogoBase'=>'','translations'=>$translations],'empty custom logo base');
    foreach(['category'=>'Category.Item.CategoryItem','content'=>'Category.Item.CategoryItemContent','home'=>'Category.Item.Partials.CategoryGridOnly']as$kind=>$name)foreach([1,2]as$page)foreach([0,6,60]as$count){
        $items=phase11Items($count,$lang);$ctx=['itemList'=>$items,'services'=>new Phase11CardServices($lang,'EUR'),'category'=>['id'=>100,'details'=>[['name'=>'Fixture']]],'currentPage'=>$page,'itemCountTotal'=>$count,'pageMax'=>3,'isSearch'=>false,'catDetails'=>['name'=>'Fixture'],'translations'=>$translations];
        $r=card13Pair($t,$f,'GuardiansBasicB2B::'.$name,$ctx,$lang.'/'.$kind.'/'.$page.'/'.$count);
        phase11Check(count(card13Contract($r['after']['html']))===$count,'Exact list count');
        $lists[]=['lang'=>$lang,'kind'=>$kind,'page'=>$page,'count'=>$count,'before'=>$r['before']['counts'],'after'=>$r['after']['counts'],'calls'=>$r['after']['calls']];
    }
    if($lang==='de')foreach(['Category.Item.Partials.CategoryListItem','Category.Item.Partials.CategoryAttributes','Category.Item.CategoryItem','Category.Item.CategoryItemContent'] as $changed){
        $samples=[];$macro=strpos($changed,'Partials')===false;
        foreach(['before','after'] as $v){
            $probe=new Phase11CardFixture($lang);$env=phase11Environment($probe,true,true);
            if($v==='after')$env->getLoader()->setTemplate('GuardiansBasicB2B::'.$changed,file_get_contents(__DIR__.'/../resources/views/'.str_replace('.','/',$changed).'.twig'));
            $context=$macro?['item'=>phase11Items(1,$lang)[0],'variant'=>1,'currencycheck'=>'EUR','translations'=>$translations,'transLabels'=>['availsizeonesize'=>'OneSize']]:['itemList'=>phase11Items(60,$lang),'services'=>new Phase11CardServices($lang,'EUR')];
            $entry='GuardiansBasicB2B::Category.Item.Partials.CategoryGridOnly';
            if($macro){$entry='isolated-macro';$env->getLoader()->setTemplate($entry,"{% import 'GuardiansBasicB2B::".$changed."' as c %}{{ c.categoryItem(item,variant,currencycheck,false,translations,transLabels,null) }}");}
            $samples[$v]=$env->render($entry,$context);
        }
        phase11Check(card13Contract($samples['before'])===card13Contract($samples['after']),'Isolated change contract: '.$changed);
        $isolated[]=['template'=>$changed,'cards'=>$macro?1:60,'before'=>cardMarkupCounts($samples['before']),'after'=>cardMarkupCounts($samples['after'])];
    }
    // Visual data is explicit: public product photographs, varied local card fixtures.
    $photoFile=dirname($argv[3]).'/visual-selected.json';
    if(is_file($photoFile)){
        $photos=json_decode(file_get_contents($photoFile),true);$markup=['before'=>'','after'=>''];
        foreach($photos as $i=>$photo){
            $item=phase11Items(12,$lang)[$i%12];$item['data']['texts']['name1']=$photo['name'];
            $item['data']['images']['all']=[['urlPreview'=>'/visual/'.$i.'.jpg']];
            $item['data']['item']['manufacturer']=['name'=>$photo['brand'],'logo'=>$i%3===2?'':'/visual/'.$i.'-logo'];
            $item['data']['item']['feedbackCount']=$i%3===1?0:5;
            $item['data']['item']['feedbackDecimal']=4.2;
            $sizes=$i%3===0?['OneSize']:($i%3===1?['S','M','L']:['34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49']);
            $values=[];foreach($sizes as$n=>$size)$values[]=['position'=>$n,'name'=>$size];
            $ctx=['item'=>$item,'translations'=>$translations,'transLabels'=>['availsizeonesize'=>'OneSize'],'cardAttributeMap'=>['attributes'=>[['type'=>'box','values'=>$values]]],'cardPriorityImage'=>$i===0];
            foreach(['before','after']as$v)$markup[$v].='<article class="post col-6 col-sm-6 col-md-3 col-lg-3 col-xl-2 col-xlg-2 col-xxlg-2">'.$t[$v]->render('GuardiansBasicB2B::Category.Item.Partials.CategoryListItem',$ctx).'</article>';
        }
        foreach($markup as$v=>$html)file_put_contents(dirname($argv[3]).'/cards-'.$lang.'-'.$v.'.html','<div class="category-product-list row">'.$html.'</div>');
    }
}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>Twig\Environment::VERSION,'cards'=>$cards,'lists'=>$lists,'isolated'=>$isolated,'limits'=>['Real local templates and fonts; platform services are fixtures. No native customer acceptance or transfer timing.']],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($cards).' card contracts, '.count($lists).' lists, 5 custom-logo fallbacks and 4 isolated change pairs PASS; Twig '.Twig\Environment::VERSION.PHP_EOL;
