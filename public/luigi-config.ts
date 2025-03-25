/*
 * Copyright 2025 NEC Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

// @ts-nocheck
import oidcProvider from '@luigi-project/plugin-auth-oidc';

import { i18nProvider } from './i18n/i18n-provider';

const jwt = require('jsonwebtoken');

window.addEventListener('storage', (event) => {
  if (event.key === 'luigi.auth' && event.newValue === null) {
    window.location.href = `${process.env.NEXT_PUBLIC_URL_CORE}`;
  }
});

i18nProvider.init().then(() => {
  Luigi.setConfig({
    auth: {
      use: 'openIdConnect',
      openIdConnect: {
        idpProvider: oidcProvider,
        authority: `${process.env.NEXT_PUBLIC_URL_IDP}/realms/${process.env.NEXT_PUBLIC_IDP_REALMS}`,
        logoutUrl: `${process.env.NEXT_PUBLIC_URL_IDP}/realms/${process.env.NEXT_PUBLIC_IDP_REALMS}/protocol/openid-connect/logout`,
        redirect_uri: `${process.env.NEXT_PUBLIC_URL_CORE}`,
        post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_URL_CORE}`,
        scope: 'openid profile email',
        client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
        response_type: 'code', // for PKCE
        response_mode: 'fragment', // for PKCE
        automaticSilentRenew: true,
        accessTokenExpiringNotificationTime: 60,
        userInfoFn: (authSettings: Object, authData: { accessToken: string }) => {
          return new Promise((resolve) => {
            const decoded = jwt.decode(authData.accessToken);
            const userInfo = {};
            userInfo.name = `${
              decoded.preferred_username
                ? `${decoded.preferred_username}${decoded.name ? `(${decoded.name})` : ''}`
                : `${decoded.name || ''}`
            }`;
            userInfo.email = decoded.mail;

            // Get the user's configured language in Keycloak or the browser's language setting
            const locale = (decoded.locale || window.navigator.language).split('-')[0];
            // Default to 'en' for languages not supported
            Luigi.i18n().setCurrentLocale(i18nProvider.translationTable[locale] ? locale : 'en');
            resolve(userInfo);
          });
        },
        profileStorageInterceptorFn: (jwtProfile: Object) => {},
      },
      events: {
        onAuthSuccessful: (settings: Object, authData: Object) => {},
        onAuthError: (settings: Object, err: Object) => {
          console.error('AuthError', err);
          Luigi.auth().logout(); // Explicitly log out
        },
        onAuthExpired: (settings: Object) => {},
        onLogout: (settings: Object) => {
          // Remove all keys starting with 'oidc.'
          for (const key in localStorage) {
            if (key.startsWith('oidc.')) {
              localStorage.removeItem(key);
            }
          }
        },
        onAuthExpireSoon: (settings: Object) => {},
        onAuthConfigError: (settings: Object, err: Object) => {
          console.error('AuthConfigError', err);
        },
      },
    },
    navigation: {
      // For each node, the following function is automatically executed for access control
      nodeAccessibilityResolver: (nodeToCheckPermissionFor, parentNode, currentContext) => {
        // Nodes other than those in the sidebar and collapsible nodes in the sidebar are always displayed
        if (nodeToCheckPermissionFor.category === undefined) return true;
        if (nodeToCheckPermissionFor.category.collapsible) return true;

        const roleToCategory = {
          cdim_view_resource: 'Resource Management',
          cdim_view_layout: 'Layout Management',
          cdim_view_user: 'User Management',
        };

        const targetCategory = nodeToCheckPermissionFor.category;

        /** @type {null | JwtPayload | string} */
        const decodedToken = jwt.decode(Luigi.auth().store.getAuthData().accessToken);
        const roles: string[] =
          (typeof decodedToken !== 'string' &&
            decodedToken?.realm_access?.roles.map((roleName: string) => roleName.replace(/-/g, '_'))) ||
          [];

        return roles.some((role) => targetCategory === roleToCategory[role]);
      },
      nodes: () => {
        const locale = Luigi.i18n().getCurrentLocale();
        const isHideMenu = (menu) => {
          return !(menu === 'true');
        };
        return [
          {
            pathSegment: 'cdim',
            label: 'Composable Disaggregated Infrastructure Manager',
            icon: 'home',
            viewUrl: `/${locale}/home`,
            children: [
              {
                category: {
                  label: 'Resource Management',
                  icon: 'multiple-line-chart',
                  collapsible: true,
                },
              },
              {
                pathSegment: 'res-summary',
                category: 'Resource Management',
                label: 'Summary',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/summary`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_SUMMARY),
              },
              {
                pathSegment: 'res-resource-group-list',
                category: 'Resource Management',
                label: 'Resource Groups',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/resource-group-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_RESOURCE_GROUPS),
              },
              {
                pathSegment: 'res-resource-group-detail',
                category: 'Resource Management',
                label: 'Resource Group Details',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/resource-group-detail`,
                hideFromNav: true, // Hidden
              },
              {
                pathSegment: 'res-rack',
                category: 'Resource Management',
                label: 'Rack Elevations',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/rack`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_RACK_ELEVATIONS),
              },
              {
                pathSegment: 'res-cxl-switch-list',
                category: 'Resource Management',
                label: 'CXL Switches',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/cxl-switch-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_CXL_SWITCHES),
              },
              {
                pathSegment: 'res-node-list',
                category: 'Resource Management',
                label: 'Nodes',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/node-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_NODES),
              },
              {
                pathSegment: 'res-node-detail',
                category: 'Resource Management',
                label: 'Node Details',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/node-detail`,
                hideFromNav: true, // Hidden
              },
              {
                pathSegment: 'res-resource-list',
                category: 'Resource Management',
                label: 'Resources.list',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/resource-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_RES_RESOURCES),
              },
              {
                pathSegment: 'res-resource-detail',
                category: 'Resource Management',
                label: 'Resource Details',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_RESOURCE}/${locale}/resource-detail`,
                hideFromNav: true, // Hidden
              },
              {
                category: {
                  label: 'Layout Management',
                  icon: 'overview-chart',
                  collapsible: true,
                },
              },
              {
                pathSegment: 'lay-layout-list',
                category: 'Layout Management',
                label: 'Layout Designs',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_LAYOUT}/${locale}/layout-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_LAY_LAYOUT_DESIGNS),
              },
              {
                pathSegment: 'lay-layout-detail',
                category: 'Layout Management',
                label: 'Layout Design Details ',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_LAYOUT}/${locale}/layout-detail`,
                hideFromNav: true, // Hidden
              },
              {
                pathSegment: 'lay-layout-apply-list',
                category: 'Layout Management',
                label: 'LayoutApplies.list',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_LAYOUT}/${locale}/layout-apply-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_LAY_LAYOUT_APPLIES),
              },
              {
                pathSegment: 'lay-layout-apply-detail',
                category: 'Layout Management',
                label: 'Layout Applies Details',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_LAYOUT}/${locale}/layout-apply-detail`,
                hideFromNav: true, // Hidden
              },
              {
                pathSegment: 'lay-policy',
                category: 'Layout Management',
                label: 'Policies',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_LAYOUT}/${locale}/policy`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_LAY_POLICIES),
              },
              {
                category: {
                  label: 'User Management',
                  icon: 'user-settings',
                  collapsible: true,
                },
              },
              {
                pathSegment: 'user-list',
                category: 'User Management',
                label: 'Users',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_USER}/${locale}/user-list`,
                hideFromNav: isHideMenu(process.env.NEXT_PUBLIC_DISPLAY_MENU_USER_USERS),
              },
              {
                pathSegment: 'user-detail',
                category: 'User Management',
                label: 'User Details',
                viewUrl: `${process.env.NEXT_PUBLIC_URL_USER}/${locale}/user-detail`,
                hideFromNav: true,
              },
            ],
          },
        ];
      },
      profile: {
        logout: {
          label: 'Log out',
          icon: 'sys-cancel',
        },
      },
    },
    routing: {
      useHashRouting: true,
    },
    settings: {
      header: {
        title: process.env.NEXT_PUBLIC_HEADER_TITLE || 'Composable Disaggregated Infrastructure Manager',
        logo: '/favicon.ico',
      },
      customTranslationImplementation: i18nProvider,
      sideNavFooterText: '',
      responsiveNavigation: 'semiCollapsible',
      burgerTooltip: {
        navExpanded: 'Collapse menu',
        navCollapsed: 'Expand menu',
      },
    },
    lifecycleHooks: {
      luigiAfterInit: () => {
        i18nProvider.afterInit();
      },
    },
    communication: {
      customMessagesListeners: {
        'my-micro-frontend-is-ready': () => {
          Luigi.ux().hideAppLoadingIndicator();
        },
        'my-custom-message.from-client': (customMessage, mfObject, mfNodeObj) => {
          Luigi.ux().showAlert({
            text: '[Core]Message from client: ' + customMessage.msg,
            closeAfter: 5000,
          });
          console.info('[Core]Message from client: ', customMessage, mfObject, mfNodeObj);

          const newCustomMessage = {
            id: 'luigi.my-custom-message-from-core',
            description: 'send message.',
          };
          Luigi.customMessages().send(mfObject.id, newCustomMessage);
          const allCustomMessage = {
            id: 'luigi.my-custom-message-from-core',
            description: 'sendToAll message.',
          };
          Luigi.customMessages().sendToAll(allCustomMessage);
        },
      },
    },
  });
});
