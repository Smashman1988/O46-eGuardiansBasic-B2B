<?php

namespace GuardiansBasicB2B\Containers;

use Plenty\Plugin\Templates\Twig;

class GuardiansBasicItemListContainer1
{
    public function call(Twig $twig, $arg):string
    {
        return $twig->render('GuardiansBasicB2B::Containers.ItemLists.ItemList1', ["item" => $arg[0]]);
    }
}

