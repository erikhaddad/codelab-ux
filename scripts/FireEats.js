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

/**
 * Initializes the FireEats app.
 */
function FireEats() {
    this.filters = {
        city: '',
        price: '',
        category: '',
        sort: 'Rating'
    };

    this.dialogs = {};

    firebase.auth()
        .signInAnonymously()
        .then(() => {
            this.initTemplates();
            this.initRouter();
            this.initReviewDialog();
            this.initFilterDialog();
        }).catch(err => {
            console.log(err);
        });

    // [START get_messaging_object]
    // Retrieve Firebase Messaging object.
    this.messaging = firebase.messaging();
    // [END get_messaging_object]

    // IDs of divs that display Instance ID token UI or request permission UI.
    this.tokenDivId = 'token_div';
    this.permissionDivId = 'permission_div';

    // [START refresh_token]
    // Callback fired if Instance ID token is updated.
    this.messaging.onTokenRefresh(() => {
        this.messaging.getToken()
            .then(refreshedToken => {
                console.log('Token refreshed.');
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
                this.setTokenSentToServer(false);
                // Send Instance ID token to app server.
                this.sendTokenToServer(refreshedToken);
                // [START_EXCLUDE]
                // Display new Instance ID token and clear UI of all previous messages.
                this.resetUI();
                // [END_EXCLUDE]
            })
            .catch(err => {
                console.log('Unable to retrieve refreshed token ', err);
                this.showToken('Unable to retrieve refreshed token ', err);
            });
    });
    // [END refresh_token]

    // [START receive_message]
    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    this.messaging.onMessage(payload => {
        console.log("Message received. ", payload);
        // [START_EXCLUDE]
        // Update the UI to include the received message.
        this.appendMessage(payload);
        // [END_EXCLUDE]
    });
    // [END receive_message]

    this.resetUI();
}

/**
 * Initializes the router for the FireEats app.
 */
FireEats.prototype.initRouter = function () {
    this.router = new Navigo();

    this.router
        .on({
            '/': () => {
                this.updateQuery(this.filters);
            }
        })
        .on({
            '/setup': () => {
                this.viewSetup();
            }
        })
        .on({
            '/restaurants/*': () => {
                let path = this.getCleanPath(document.location.pathname);
                const id = path.split('/')[2];
                this.viewRestaurant(id);
            }
        })
        .resolve();

    firebase
        .firestore()
        .collection('restaurants')
        .limit(1)
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                this.router.navigate('/setup');
            }
        });
};

FireEats.prototype.getCleanPath = function (dirtyPath) {
    if (dirtyPath.startsWith('/index.html')) {
        return dirtyPath.split('/').slice(1).join('/');
    } else {
        return dirtyPath;
    }
};

FireEats.prototype.getFirebaseConfig = function () {
    return firebase.app().options;
};

FireEats.prototype.getRandomItem = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

FireEats.prototype.data = {
    words: [
        'Bar',
        'Fire',
        'Grill',
        'Drive Thru',
        'Place',
        'Best',
        'Spot',
        'Prime',
        'Eatin\''
    ],
    cities: [
        'Albuquerque',
        'Arlington',
        'Atlanta',
        'Austin',
        'Baltimore',
        'Boston',
        'Charlotte',
        'Chicago',
        'Cleveland',
        'Colorado Springs',
        'Columbus',
        'Dallas',
        'Denver',
        'Detroit',
        'El Paso',
        'Fort Worth',
        'Fresno',
        'Houston',
        'Indianapolis',
        'Jacksonville',
        'Kansas City',
        'Las Vegas',
        'Long Island',
        'Los Angeles',
        'Louisville',
        'Memphis',
        'Mesa',
        'Miami',
        'Milwaukee',
        'Nashville',
        'New York',
        'Oakland',
        'Oklahoma',
        'Omaha',
        'Philadelphia',
        'Phoenix',
        'Portland',
        'Raleigh',
        'Sacramento',
        'San Antonio',
        'San Diego',
        'San Francisco',
        'San Jose',
        'Tucson',
        'Tulsa',
        'Virginia Beach',
        'Washington'
    ],
    categories: [
        'Brunch',
        'Burgers',
        'Coffee',
        'Deli',
        'Dim Sum',
        'Indian',
        'Italian',
        'Mediterranean',
        'Mexican',
        'Pizza',
        'Ramen',
        'Sushi'
    ],
    ratings: [
        {
            rating: 1,
            text: 'Would never eat here again!'
        },
        {
            rating: 2,
            text: 'Not my cup of tea.'
        },
        {
            rating: 3,
            text: 'Exactly okay :/'
        },
        {
            rating: 4,
            text: 'Actually pretty good, would recommend!'
        },
        {
            rating: 5,
            text: 'This is my favorite place. Literally.'
        }
    ]
};

window.onload = () => {
    window.app = new FireEats();
};
