<?php

namespace GuardiansBasicB2B\Containers;

use Plenty\Plugin\Templates\Twig;

class GuardiansBasicContainer
{
    public function call(Twig $twig):string
    {
        return $twig->render('GuardiansBasicB2B::Stylesheet');
    }
}
