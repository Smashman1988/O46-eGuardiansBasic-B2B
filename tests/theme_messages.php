<?php
// Render the actual PageDesign message object before/after with real theme texts.
// php tests/theme_messages.php <Twig autoloader> <before PageDesign.twig> <report.json>
require $argv[1];
class MessageTranslator {
    public $texts=[], $calls=[];
    function translate($key) {
        $this->calls[]=$key;
        return $this->texts[substr($key,strrpos($key,'.')+1)] ?? $key;
    }
}
function objectSource($file) {
    $source=file_get_contents($file);
    if (!preg_match('/var messageServiceTranslations = (\{.*?\n\s*\})/s',$source,$m)) throw new RuntimeException('Message object missing');
    return $m[1];
}
$translator=new MessageTranslator();
$twig=new Twig\Environment(new Twig\Loader\ArrayLoader());
$twig->addFunction(new Twig\TwigFunction('trans',[$translator,'translate']));
$rows=[];
foreach (['de','en','fr','it','es'] as $language) {
    $translator->texts=[];
    foreach(file(dirname(__DIR__).'/resources/lang/'.$language.'/Template.properties') as $line) {
        if(preg_match('/^([A-Za-z0-9_]+)\s*=\s*(.*)$/u',trim($line),$m)) $translator->texts[$m[1]]=trim($m[2],"\"'");
    }
    $pair=[];
    foreach (['before'=>$argv[2],'after'=>dirname(__DIR__).'/resources/views/PageDesign/PageDesign.twig'] as $name=>$file) {
        $translator->calls=[];
        $html=$twig->createTemplate(objectSource($file))->render([]);
        $object=json_decode($html,true,512,JSON_THROW_ON_ERROR);
        $pair[$name]=['object'=>$object,'calls'=>$translator->calls,'bytes'=>strlen($html)];
    }
    if ($pair['before']['object']!==$pair['after']['object']) throw new RuntimeException('Changed translated messages: '.$language);
    if (count($pair['before']['calls'])-count($pair['after']['calls'])!==1) throw new RuntimeException('Expected one removed translation');
    $rows[]=['lang'=>$language,'beforeBytes'=>$pair['before']['bytes'],'afterBytes'=>$pair['after']['bytes'],
        'beforeTranslations'=>count($pair['before']['calls']),'afterTranslations'=>count($pair['after']['calls']),
        'effectiveLoginSuccess'=>$pair['after']['object']['loginSuccess'],'status'=>'PASS'];
}
file_put_contents($argv[3],json_encode(['twig'=>Twig\Environment::VERSION,'rows'=>$rows],JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo count($rows)." language message objects identical; one redundant translation removed each.\n";
