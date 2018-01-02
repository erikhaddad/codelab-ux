/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

FireEats.prototype.resetUI = function () {
    this.clearMessages();
    this.showToken('loading...');
    // [START get_token]
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    this.messaging.getToken()
        .then(currentToken => {
            if (currentToken) {
                this.sendTokenToServer(currentToken);
                this.updateUIForPushEnabled(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                this.updateUIForPushPermissionRequired();
                this.setTokenSentToServer(false);
            }
        })
        .catch(err => {
            console.log('An error occurred while retrieving token. ', err);
            this.showToken('Error retrieving Instance ID token. ', err);
            this.setTokenSentToServer(false);
        });
};
// [END get_token]

FireEats.prototype.showToken = function (currentToken) {
    // Show token in console and UI.
    const tokenElement = document.querySelector('#token');
    if (tokenElement) {
        tokenElement.textContent = currentToken;
    }
};

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
FireEats.prototype.sendTokenToServer = function (currentToken) {
    if (!this.isTokenSentToServer()) {
        console.log('Sending token to server...');
        // TODO(developer): Send the current token to your server.
        this.setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }
};

FireEats.prototype.isTokenSentToServer = function () {
    return window.localStorage.getItem('sentToServer') === '1';
};

FireEats.prototype.setTokenSentToServer = function (sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
};

FireEats.prototype.isTokenBannerDismissed = function () {
    return window.localStorage.getItem('tokenBannerDismissed') === '1';
};
FireEats.prototype.setTokenBannerDismissed = function (dismissed) {
    window.localStorage.setItem('tokenBannerDismissed', dismissed ? 1 : 0);
};

FireEats.prototype.showHideDiv = function (divId, show) {
    const div = document.querySelector('#' + divId);
    if (div) {
        if (show) {
            div.style = "display: visible";
        } else {
            div.style = "display: none";
        }
    }
};

FireEats.prototype.requestPermission = function () {
    console.log('Requesting permission...');
    // [START request_permission]
    this.messaging.requestPermission()
        .then(() => {
            console.log('Notification permission granted.');
            // TODO(developer): Retrieve an Instance ID token for use with FCM.
            // [START_EXCLUDE]
            // In many cases once an app has been granted notification permission, it
            // should update its UI reflecting this.
            this.resetUI();
            // [END_EXCLUDE]
        })
        .catch(err => {
            console.log('Unable to get permission to notify.', err);
        });
    // [END request_permission]
};

FireEats.prototype.deleteToken = function () {
    // Delete Instance ID token.
    // [START delete_token]
    this.messaging.getToken()
        .then(currentToken => {
            this.messaging.deleteToken(currentToken)
                .then(() => {
                    console.log('Token deleted.');
                    this.setTokenSentToServer(false);
                    // [START_EXCLUDE]
                    // Once token is deleted update UI.
                    this.resetUI();
                    // [END_EXCLUDE]
                })
                .catch(err => {
                    console.log('Unable to delete token. ', err);
                });
            // [END delete_token]
        })
        .catch(err => {
            console.log('Error retrieving Instance ID token. ', err);
            this.showToken('Error retrieving Instance ID token. ', err);
        });

};

// Add a message to the messages element.
FireEats.prototype.appendMessage = function (payload) {
    const messagesElement = document.querySelector('#messages');
    const dataHeaderElement = document.createElement('h5');
    const dataElement = document.createElement('pre');
    dataElement.style = 'overflow-x:hidden;';
    dataHeaderElement.textContent = 'Received message:';
    dataElement.textContent = JSON.stringify(payload, null, 2);
    messagesElement.appendChild(dataHeaderElement);
    messagesElement.appendChild(dataElement);
};

// Clear the messages element of all children.
FireEats.prototype.clearMessages = function () {
    const messagesElement = document.querySelector('#messages');
    if (messagesElement) {
        while (messagesElement.hasChildNodes()) {
            messagesElement.removeChild(messagesElement.lastChild);
        }
    }
};

FireEats.prototype.updateUIForPushEnabled = function (currentToken) {
    console.log('updateUIForPushEnabled', this.isTokenBannerDismissed());
    const msgsBannerDivId = 'messages-banner';
    if (this.isTokenBannerDismissed()) {
        this.showHideDiv(msgsBannerDivId, false);
    }

    this.showHideDiv(this.tokenDivId, true);
    this.showHideDiv(this.permissionDivId, false);
    this.showToken(currentToken);

    const deleteTokenBtn = document.querySelector('#delete-token');
    const dismissBannerBtn = document.querySelector('#dismiss-banner');

    deleteTokenBtn.addEventListener('click', event => {
        this.deleteToken();
    });

    dismissBannerBtn.addEventListener('click', event => {
        this.showHideDiv(msgsBannerDivId, false);
        this.setTokenBannerDismissed(true);
    });
};

FireEats.prototype.updateUIForPushPermissionRequired = function () {
    console.log('updateUIForPushPermissionRequired', this.isTokenBannerDismissed());
    const msgsBannerDivId = 'messages-banner';
    if (this.isTokenBannerDismissed()) {
        this.showHideDiv(msgsBannerDivId, true);
    }

    this.showHideDiv(this.tokenDivId, false);
    this.showHideDiv(this.permissionDivId, true);

    const reqPermBtn = document.querySelector('#request-permission');

    reqPermBtn.addEventListener('click', event => {
        this.requestPermission();
    });
};
