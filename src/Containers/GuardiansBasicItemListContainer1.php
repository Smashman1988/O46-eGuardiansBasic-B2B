<?php

namespace GuardiansBasic\Containers;

use Plenty\Plugin\Templates\Twig;

class GuardiansBasicItemListContainer1
{
    public function call(Twig $twig, $arg):string
    {
        return $twig->render('GuardiansBasic::Containers.ItemLists.ItemList1', ["item" => $arg[0]]);
    }
}

