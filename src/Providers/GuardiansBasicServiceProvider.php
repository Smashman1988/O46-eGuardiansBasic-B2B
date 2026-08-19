<?php

namespace GuardiansBasic\Providers;

use Ceres\Caching\NavigationCacheSettings;
use Ceres\Caching\SideNavigationCacheSettings;
use IO\Services\ContentCaching\Services\Container;
use Plenty\Modules\Webshop\ItemSearch\Helpers\ResultFieldTemplate;
use Plenty\Plugin\ServiceProvider;
use Plenty\Plugin\Events\Dispatcher;
use Plenty\Plugin\Templates\Twig;
use IO\Helper\TemplateContainer;
use IO\Extensions\Functions\Partial;
use Plenty\Plugin\ConfigRepository;
use GuardiansBasic\Extensions\Base_Extension;
use Plenty\Modules\Webshop\Consent\Contracts\ConsentRepositoryContract;

/**
 * Class GuardiansBasicServiceProvider
 * @package GuardiansBasic\Providers
 */
class GuardiansBasicServiceProvider extends ServiceProvider
{
    const PRIORITY = 0;

    public function register()
    {
        $this->getApplication()->register(\GuardiansBasic\Providers\GuardiansBasicRouteServiceProvider::class);
        $this->getApplication()->register(\GuardiansBasic\Providers\GuardiansBasicRouteServiceProvider::class);
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
        $enabledOverrides = explode(", ", $config->get("GuardiansBasic.templates.override"));
        // Override partials
        $dispatcher->listen('IO.init.templates', function (Partial $partial) use ($enabledOverrides)
        {
            //pluginApp(Container::class)->register('GuardiansBasic::PageDesign.Partials.Header.NavigationList.twig', NavigationCacheSettings::class);
            //pluginApp(Container::class)->register('GuardiansBasic::PageDesign.Partials.Header.SideNavigation.twig', SideNavigationCacheSettings::class);
            $partial->set('head', 'Ceres::PageDesign.Partials.Head');
            $partial->set('header', 'Ceres::PageDesign.Partials.Header.Header');
            $partial->set('page-design', 'Ceres::PageDesign.PageDesign');
            $partial->set('page-metadata', 'GuardiansBasic::PageDesign.Partials.PageMetadata');
            $partial->set('footer', 'Ceres::PageDesign.Partials.Footer');

            if (in_array("head", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('head', 'GuardiansBasic::PageDesign.Partials.Head');
            }

            if (in_array("header", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('header', 'GuardiansBasic::PageDesign.Partials.Header.Header');
            }

            if (in_array("page_design", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('page-design', 'GuardiansBasic::PageDesign.PageDesign');
            }

            if (in_array("footer", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('footer', 'GuardiansBasic::PageDesign.Partials.Footer');
            }

            return false;
        }, self::PRIORITY);

        // Override homepage
        if (in_array("homepage", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.home', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Homepage.Homepage');
                return false;
            }, self::PRIORITY);
        }

        // Override template for content categories
        if (in_array("category_content", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.category.content', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Category.Content.CategoryContent');
                return false;
            }, self::PRIORITY);
        }

        // Override template for item categories
        if (in_array("category_item", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.category.item', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Category.Item.CategoryItem');
                return false;
            }, self::PRIORITY);
        }

        // Override shopping cart
        if (in_array("basket", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.basket', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Basket.Basket');
                return false;
            }, self::PRIORITY);
        }

        // Override checkout
        if (in_array("checkout", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.checkout', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Checkout.CheckoutView');
                return false;
            }, self::PRIORITY);
        }

        // Override order confirmation page
        if (in_array("order_confirmation", $enabledOverrides) || in_array("all", $enabledOverrides))
        {
            $dispatcher->listen('IO.tpl.confirmation', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Checkout.OrderConfirmation');
                return false;
            }, self::PRIORITY);
        }

        // Override login page
        if (in_array("login", $enabledOverrides) || in_array("all", $enabledOverrides))
        {
            $dispatcher->listen('IO.tpl.login', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Customer.Login');
                return false;
            }, self::PRIORITY);
        }

        // Override register page
        if (in_array("register", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.register', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Customer.Register');
                return false;
            }, self::PRIORITY);
        }

        // Override single item page
        if (in_array("item", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.item', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Item.SingleItem');
                return false;
            }, self::PRIORITY);
        }
        // Override category view
        if (in_array("category_view", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.search', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::Category.Item.CategoryItem');
                return false;
            }, self::PRIORITY);
        }

        // Override my account
        if (in_array("my_account", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.my-account', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::MyAccount.MyAccount');
                return false;
            }, self::PRIORITY);
        }

        // Override cancellation rights
        if (in_array("cancellation_rights", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.cancellation-rights', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.CancellationRights');
                return false;
            }, self::PRIORITY);
        }

        // Override legal disclosure
        if (in_array("legal_disclosure", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.legal-disclosure', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.LegalDisclosure');
                return false;
            }, self::PRIORITY);
        }

        // Override privacy policy
        if (in_array("privacy_policy", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.privacy-policy', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.PrivacyPolicy');
                return false;
            }, self::PRIORITY);
        }

        // Override terms and conditions
        if (in_array("terms_conditions", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.terms-conditions', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.TermsAndConditions');
                return false;
            }, self::PRIORITY);
        }

        // Override item not found page
        if (in_array("item_not_found", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.item-not-found', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.ItemNotFound');
                return false;
            }, self::PRIORITY);
        }

        // Override page not found page
        if (in_array("page_not_found", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.page-not-found', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasic::StaticPages.PageNotFound');
                return false;
            }, self::PRIORITY);
        }
        $enabledOverrides = explode(", ", $config->get("GuardiansBasic.templates.override"));
        $resultFieldTemplate = pluginApp(ResultFieldTemplate::class);
        $resultFieldTemplate->setTemplates([
            ResultFieldTemplate::TEMPLATE_LIST_ITEM     => 'GuardiansBasic::ResultFields.ListItem',
            ResultFieldTemplate::TEMPLATE_SINGLE_ITEM   => 'GuardiansBasic::ResultFields.SingleItem',
            ResultFieldTemplate::TEMPLATE_BASKET_ITEM   => 'GuardiansBasic::ResultFields.BasketItem',
            ResultFieldTemplate::TEMPLATE_AUTOCOMPLETE_ITEM_LIST => 'GuardiansBasic::ResultFields.AutoCompleteListItem',
            ResultFieldTemplate::TEMPLATE_CATEGORY_TREE => 'GuardiansBasic::ResultFields.CategoryTree',
            ResultFieldTemplate::TEMPLATE_VARIATION_ATTRIBUTE_MAP => 'Ceres::ResultFields.VariationAttributeMap'
        ]);
        /*
        $dispatcher->listen( 'IO.ResultFields.*', function(ResultFieldTemplate $container) {
            $container->setTemplates([
                ResultFieldTemplate::TEMPLATE_LIST_ITEM     => 'GuardiansBasic::ResultFields.ListItem',
                ResultFieldTemplate::TEMPLATE_SINGLE_ITEM   => 'GuardiansBasic::ResultFields.SingleItem',
                ResultFieldTemplate::TEMPLATE_BASKET_ITEM   => 'GuardiansBasic::ResultFields.BasketItem',
                ResultFieldTemplate::TEMPLATE_AUTOCOMPLETE_ITEM_LIST => 'GuardiansBasic::ResultFields.AutoCompleteListItem',
                ResultFieldTemplate::TEMPLATE_CATEGORY_TREE => 'GuardiansBasic::ResultFields.CategoryTree',
                ResultFieldTemplate::TEMPLATE_VARIATION_ATTRIBUTE_MAP => 'Ceres::ResultFields.VariationAttributeMap'
            ]);
            return false;
        }, self::PRIORITY);*/
    }
}



