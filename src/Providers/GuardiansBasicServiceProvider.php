<?php

namespace GuardiansBasicB2B\Providers;

use Plenty\Modules\Webshop\ItemSearch\Helpers\ResultFieldTemplate;
use Plenty\Plugin\ServiceProvider;
use Plenty\Plugin\Events\Dispatcher;
use Plenty\Plugin\Templates\Twig;
use IO\Helper\TemplateContainer;
use IO\Extensions\Functions\Partial;
use Plenty\Plugin\ConfigRepository;
use GuardiansBasicB2B\Extensions\Base_Extension;
use GuardiansBasicB2B\Contexts\EnglishTextSearchContext;
use GuardiansBasicB2B\Services\EnglishTextSearch;
use Plenty\Modules\Webshop\Consent\Contracts\ConsentRepositoryContract;

/**
 * Class GuardiansBasicServiceProvider
 * @package GuardiansBasicB2B\Providers
 */
class GuardiansBasicServiceProvider extends ServiceProvider
{
    const PRIORITY = 0;

    public function register()
    {
        $this->getApplication()->register(\GuardiansBasicB2B\Providers\GuardiansBasicRouteServiceProvider::class);
        $consentRepository = pluginApp(ConsentRepositoryContract::class);
        $consentRepository->registerConsent(
            'PoP-UP Anzeige',
            'PoP-UP Anzeige',
            [
                'description' => '-',
                'provider' => 'Outlet46.de GmbH',
                'lifespan' => 'Session',
                'policyUrl' => 'https://b2b.outlet46.de/datenschutz/',
                'group' => 'necessary',
                'necessary' => true,
                'isOptOut' => false,
                'cookieNames' => ['showModal', 'setCookie', 'o46_shop_mode']
            ]
        );
        $consentRepository->registerConsent(
            'Language, Currency',
            'Language, Currency',
            [
                'description' => '-',
                'provider' => 'Outlet46.de GmbH',
                'lifespan' => 'Session',
                'policyUrl' => 'https://b2b.outlet46.de/datenschutz/',
                'group' => 'necessary',
                'necessary' => true,
                'isOptOut' => false,
                'cookieNames' => ['language', 'ledgerCurrency', 'apay-session-set', 'session-id', 'session-id-apay', 'session-id-time', 'session-token', 'JSESSIONID']
            ]
        );
                
    }
    public function boot(Twig $twig, Dispatcher $dispatcher, ConfigRepository $config)
    {
        $twig->addExtension(Base_Extension::class);
        $dispatcher->listen('IO.ctx.search', function (TemplateContainer $container)
        {
            if (EnglishTextSearch::applies()) {
                $container->setContext(EnglishTextSearchContext::class);
                return false;
            }
        }, self::PRIORITY);
        $enabledOverrides = explode(", ", $config->get("GuardiansBasicB2B.templates.override"));
        $overrideAll = in_array("all", $enabledOverrides);
        // Override partials
        $dispatcher->listen('IO.init.templates', function (Partial $partial) use ($enabledOverrides, $overrideAll)
        {
            $partial->set('head', 'Ceres::PageDesign.Partials.Head');
            $partial->set('header', 'Ceres::PageDesign.Partials.Header.Header');
            $partial->set('page-design', 'Ceres::PageDesign.PageDesign');
            $partial->set('page-metadata', 'GuardiansBasicB2B::PageDesign.Partials.PageMetadata');
            $partial->set('footer', 'Ceres::PageDesign.Partials.Footer');

            if (in_array("head", $enabledOverrides) || $overrideAll)
            {
                $partial->set('head', 'GuardiansBasicB2B::PageDesign.Partials.Head');
            }

            if (in_array("header", $enabledOverrides) || $overrideAll)
            {
                $partial->set('header', 'GuardiansBasicB2B::PageDesign.Partials.Header.Header');
            }

            if (in_array("page_design", $enabledOverrides) || $overrideAll)
            {
                $partial->set('page-design', 'GuardiansBasicB2B::PageDesign.PageDesign');
            }

            if (in_array("footer", $enabledOverrides) || $overrideAll)
            {
                $partial->set('footer', 'GuardiansBasicB2B::PageDesign.Partials.Footer');
            }

            return false;
        }, self::PRIORITY);

        // Keep registration order and configuration keys in one place.
        $templateOverrides = [
            'homepage' => ['IO.tpl.home', 'GuardiansBasicB2B::Homepage.Homepage'],
            'category_content' => ['IO.tpl.category.content', 'GuardiansBasicB2B::Category.Content.CategoryContent'],
            'category_item' => ['IO.tpl.category.item', 'GuardiansBasicB2B::Category.Item.CategoryItem'],
            'basket' => ['IO.tpl.basket', 'GuardiansBasicB2B::Basket.Basket'],
            'checkout' => ['IO.tpl.checkout', 'GuardiansBasicB2B::Checkout.CheckoutView'],
            'order_confirmation' => ['IO.tpl.confirmation', 'GuardiansBasicB2B::Checkout.OrderConfirmation'],
            'login' => ['IO.tpl.login', 'GuardiansBasicB2B::Customer.Login'],
            'register' => ['IO.tpl.register', 'GuardiansBasicB2B::Customer.Register'],
            'item' => ['IO.tpl.item', 'GuardiansBasicB2B::Item.SingleItem'],
            'category_view' => ['IO.tpl.search', 'GuardiansBasicB2B::Category.Item.CategoryItem'],
            'my_account' => ['IO.tpl.my-account', 'GuardiansBasicB2B::MyAccount.MyAccount'],
            'cancellation_rights' => ['IO.tpl.cancellation-rights', 'GuardiansBasicB2B::StaticPages.CancellationRights'],
            'legal_disclosure' => ['IO.tpl.legal-disclosure', 'GuardiansBasicB2B::StaticPages.LegalDisclosure'],
            'privacy_policy' => ['IO.tpl.privacy-policy', 'GuardiansBasicB2B::StaticPages.PrivacyPolicy'],
            'terms_conditions' => ['IO.tpl.terms-conditions', 'GuardiansBasicB2B::StaticPages.TermsAndConditions'],
            'item_not_found' => ['IO.tpl.item-not-found', 'GuardiansBasicB2B::StaticPages.ItemNotFound'],
            'page_not_found' => ['IO.tpl.page-not-found', 'GuardiansBasicB2B::StaticPages.PageNotFound'],
        ];
        foreach ($templateOverrides as $key => [$event, $template]) {
            if ($overrideAll || in_array($key, $enabledOverrides)) {
                $dispatcher->listen($event, function (TemplateContainer $container) use ($template) {
                    $container->setTemplate($template);
                    return false;
                }, self::PRIORITY);
            }
        }
        $resultFieldTemplate = pluginApp(ResultFieldTemplate::class);
        $resultFieldTemplate->setTemplates([
            ResultFieldTemplate::TEMPLATE_LIST_ITEM     => 'GuardiansBasicB2B::ResultFields.ListItem',
            ResultFieldTemplate::TEMPLATE_SINGLE_ITEM   => 'GuardiansBasicB2B::ResultFields.SingleItem',
            ResultFieldTemplate::TEMPLATE_BASKET_ITEM   => 'GuardiansBasicB2B::ResultFields.BasketItem',
            ResultFieldTemplate::TEMPLATE_AUTOCOMPLETE_ITEM_LIST => 'GuardiansBasicB2B::ResultFields.AutoCompleteListItem',
            ResultFieldTemplate::TEMPLATE_CATEGORY_TREE => 'GuardiansBasicB2B::ResultFields.CategoryTree',
            ResultFieldTemplate::TEMPLATE_VARIATION_ATTRIBUTE_MAP => 'Ceres::ResultFields.VariationAttributeMap'
        ]);
    }
}



