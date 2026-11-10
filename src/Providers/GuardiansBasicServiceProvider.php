<?php

namespace GuardiansBasicB2B\Providers;

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
use GuardiansBasicB2B\Extensions\Base_Extension;
use GuardiansBasicB2B\Contexts\EnglishTextSearchContext;
use GuardiansBasicB2B\Services\EnglishTextSearch;
use GuardiansBasicB2B\Services\SearchAutocompleteService;
use IO\Services\ItemSearchAutocompleteService;
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
        $this->getApplication()->bind(ItemSearchAutocompleteService::class, SearchAutocompleteService::class);
        $this->getApplication()->register(\GuardiansBasicB2B\Providers\GuardiansBasicRouteServiceProvider::class);
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
        // Override partials
        $dispatcher->listen('IO.init.templates', function (Partial $partial) use ($enabledOverrides)
        {
            //pluginApp(Container::class)->register('GuardiansBasicB2B::PageDesign.Partials.Header.NavigationList.twig', NavigationCacheSettings::class);
            //pluginApp(Container::class)->register('GuardiansBasicB2B::PageDesign.Partials.Header.SideNavigation.twig', SideNavigationCacheSettings::class);
            $partial->set('head', 'Ceres::PageDesign.Partials.Head');
            $partial->set('header', 'Ceres::PageDesign.Partials.Header.Header');
            $partial->set('page-design', 'Ceres::PageDesign.PageDesign');
            $partial->set('page-metadata', 'GuardiansBasicB2B::PageDesign.Partials.PageMetadata');
            $partial->set('footer', 'Ceres::PageDesign.Partials.Footer');

            if (in_array("head", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('head', 'GuardiansBasicB2B::PageDesign.Partials.Head');
            }

            if (in_array("header", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('header', 'GuardiansBasicB2B::PageDesign.Partials.Header.Header');
            }

            if (in_array("page_design", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('page-design', 'GuardiansBasicB2B::PageDesign.PageDesign');
            }

            if (in_array("footer", $enabledOverrides) || in_array("all", $enabledOverrides))
            {
                $partial->set('footer', 'GuardiansBasicB2B::PageDesign.Partials.Footer');
            }

            return false;
        }, self::PRIORITY);

        // Override homepage
        if (in_array("homepage", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.home', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Homepage.Homepage');
                return false;
            }, self::PRIORITY);
        }

        // Override template for content categories
        if (in_array("category_content", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.category.content', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Category.Content.CategoryContent');
                return false;
            }, self::PRIORITY);
        }

        // Override template for item categories
        if (in_array("category_item", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.category.item', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Category.Item.CategoryItem');
                return false;
            }, self::PRIORITY);
        }

        // Override shopping cart
        if (in_array("basket", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.basket', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Basket.Basket');
                return false;
            }, self::PRIORITY);
        }

        // Override checkout
        if (in_array("checkout", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.checkout', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Checkout.CheckoutView');
                return false;
            }, self::PRIORITY);
        }

        // Override order confirmation page
        if (in_array("order_confirmation", $enabledOverrides) || in_array("all", $enabledOverrides))
        {
            $dispatcher->listen('IO.tpl.confirmation', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Checkout.OrderConfirmation');
                return false;
            }, self::PRIORITY);
        }

        // Override login page
        if (in_array("login", $enabledOverrides) || in_array("all", $enabledOverrides))
        {
            $dispatcher->listen('IO.tpl.login', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Customer.Login');
                return false;
            }, self::PRIORITY);
        }

        // Override register page
        if (in_array("register", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.register', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Customer.Register');
                return false;
            }, self::PRIORITY);
        }

        // Override single item page
        if (in_array("item", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.item', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Item.SingleItem');
                return false;
            }, self::PRIORITY);
        }
        // Override category view
        if (in_array("category_view", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.search', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::Category.Item.CategoryItem');
                return false;
            }, self::PRIORITY);
        }

        // Override my account
        if (in_array("my_account", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.my-account', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::MyAccount.MyAccount');
                return false;
            }, self::PRIORITY);
        }

        // Override cancellation rights
        if (in_array("cancellation_rights", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.cancellation-rights', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.CancellationRights');
                return false;
            }, self::PRIORITY);
        }

        // Override legal disclosure
        if (in_array("legal_disclosure", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.legal-disclosure', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.LegalDisclosure');
                return false;
            }, self::PRIORITY);
        }

        // Override privacy policy
        if (in_array("privacy_policy", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.privacy-policy', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.PrivacyPolicy');
                return false;
            }, self::PRIORITY);
        }

        // Override terms and conditions
        if (in_array("terms_conditions", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.terms-conditions', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.TermsAndConditions');
                return false;
            }, self::PRIORITY);
        }

        // Override item not found page
        if (in_array("item_not_found", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.item-not-found', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.ItemNotFound');
                return false;
            }, self::PRIORITY);
        }

        // Override page not found page
        if (in_array("page_not_found", $enabledOverrides) || in_array("all", $enabledOverrides))
        {

            $dispatcher->listen('IO.tpl.page-not-found', function (TemplateContainer $container)
            {
                $container->setTemplate('GuardiansBasicB2B::StaticPages.PageNotFound');
                return false;
            }, self::PRIORITY);
        }
        $enabledOverrides = explode(", ", $config->get("GuardiansBasicB2B.templates.override"));
        $resultFieldTemplate = pluginApp(ResultFieldTemplate::class);
        $resultFieldTemplate->setTemplates([
            ResultFieldTemplate::TEMPLATE_LIST_ITEM     => 'GuardiansBasicB2B::ResultFields.ListItem',
            ResultFieldTemplate::TEMPLATE_SINGLE_ITEM   => 'GuardiansBasicB2B::ResultFields.SingleItem',
            ResultFieldTemplate::TEMPLATE_BASKET_ITEM   => 'GuardiansBasicB2B::ResultFields.BasketItem',
            ResultFieldTemplate::TEMPLATE_AUTOCOMPLETE_ITEM_LIST => 'GuardiansBasicB2B::ResultFields.AutoCompleteListItem',
            ResultFieldTemplate::TEMPLATE_CATEGORY_TREE => 'GuardiansBasicB2B::ResultFields.CategoryTree',
            ResultFieldTemplate::TEMPLATE_VARIATION_ATTRIBUTE_MAP => 'Ceres::ResultFields.VariationAttributeMap'
        ]);
        /*
        $dispatcher->listen( 'IO.ResultFields.*', function(ResultFieldTemplate $container) {
            $container->setTemplates([
                ResultFieldTemplate::TEMPLATE_LIST_ITEM     => 'GuardiansBasicB2B::ResultFields.ListItem',
                ResultFieldTemplate::TEMPLATE_SINGLE_ITEM   => 'GuardiansBasicB2B::ResultFields.SingleItem',
                ResultFieldTemplate::TEMPLATE_BASKET_ITEM   => 'GuardiansBasicB2B::ResultFields.BasketItem',
                ResultFieldTemplate::TEMPLATE_AUTOCOMPLETE_ITEM_LIST => 'GuardiansBasicB2B::ResultFields.AutoCompleteListItem',
                ResultFieldTemplate::TEMPLATE_CATEGORY_TREE => 'GuardiansBasicB2B::ResultFields.CategoryTree',
                ResultFieldTemplate::TEMPLATE_VARIATION_ATTRIBUTE_MAP => 'Ceres::ResultFields.VariationAttributeMap'
            ]);
            return false;
        }, self::PRIORITY);*/
    }
}



