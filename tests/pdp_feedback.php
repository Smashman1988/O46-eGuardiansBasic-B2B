<?php
// php tests/pdp_feedback.php <Twig autoloader>
// Exercise the real PDP guard and FeedbackContainer with explicit service responses.
require $argv[1];
$views = dirname(__DIR__).'/resources/views';
$single = file_get_contents($views.'/Item/SingleItem.twig');
$start = strpos($single, '{% set rawFeedbackCount =');
$end = strpos($single, '{# Detail properties', $start);
$include = strpos($single, '{% if pdpFeedbackCount is null or pdpFeedbackCount > 0 %}');
if ($start === false || $end === false || $include === false) throw new RuntimeException('PDP feedback entry point missing');
$guard = substr($single,$start,$end-$start).substr($single,$include,strpos($single,'{% endif %}',$include)+11-$include);
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader([
    'pdp' => $guard,
    'GuardiansBasicB2B::Containers.FeedbackContainer' => file_get_contents($views.'/Containers/FeedbackContainer.twig'),
    'GuardiansBasicB2B::Category.Macros.render-rating' => file_get_contents($views.'/Category/Macros/render-rating.twig'),
    'GuardiansBasicB2B::DynamicContent.DynamicFeedbacks' => '{% for entry in feedbackItems.entries %}{% if entry.isVisible == "true" %}<p>visible feedback</p>{% endif %}{% endfor %}',
]));
class PdpFeedbackFixture {
    public $reads = 0, $list = [], $average = [];
    function itemList() { $this->reads++; return $this->list; }
    function averages() { $this->reads++; return $this->average; }
    function translation($key) { return $key; }
}
$fixture = new PdpFeedbackFixture();
$twig->addFunction(new Twig\TwigFunction('getFeedbackItemList',[$fixture,'itemList']));
$twig->addFunction(new Twig\TwigFunction('getListFeedbackAverages',[$fixture,'averages']));
$twig->addFunction(new Twig\TwigFunction('trans',[$fixture,'translation']));
$cases = [
    // count, aggregate, list total, entry visibility, expected reads, section, bars, comment
    [0,0,0,[],0,false,false,false], ['0',0,0,[],0,false,false,false], [0.0,0,0,[],0,false,false,false],
    [null,0,0,[],2,false,false,false], [null,3,3,['true'],2,true,true,true],
    [2,null,null,[],2,true,false,false], ['invalid','invalid',null,['true'],2,true,false,true],
    [null,null,null,['false'],2,false,false,false], [false,null,null,[],2,false,false,false],
    [null,null,1,['true'],2,true,false,true], [1,1,1,['true'],2,true,true,true],
];
foreach ($cases as [$count,$avg,$total,$entries,$expectedReads,$section,$bars,$comment]) {
    $item = ['id'=>42,'feedbackDecimal'=>4];
    if ($count!==null) $item['feedbackCount']=$count;
    $fixture->average = ['ratingsCountTotal'=>$avg,'ratingsCountOf4'=>$avg,'averageValue'=>4];
    $fixture->list = ['totalsCount'=>$total,'entries'=>array_map(fn ($visible)=>['isVisible'=>$visible],$entries)];
    $fixture->reads=0;
    $html=$twig->render('pdp',['itemData'=>['item'=>$item]]);
    $actual=[$fixture->reads,strpos($html,'<section class="feedback-container">')!==false,
        strpos($html,'class="feedback-bars"')!==false,strpos($html,'visible feedback')!==false];
    if ($actual!==[$expectedReads,$section,$bars,$comment] || substr_count($html,'<hr')!==($section?2:0)
        || strpos($html,'Template.norating')!==false) throw new RuntimeException('Unexpected feedback output '.json_encode([$item,$actual]));
}
echo count($cases)." PDP feedback cases PASS\n";

