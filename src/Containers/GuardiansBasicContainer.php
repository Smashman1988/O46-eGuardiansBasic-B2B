<?php

namespace GuardiansBasic\Containers;

use Plenty\Plugin\Templates\Twig;

class GuardiansBasicContainer
{
    public function call(Twig $twig):string
    {
        return $twig->render('GuardiansBasic::Stylesheet');
    }
}
