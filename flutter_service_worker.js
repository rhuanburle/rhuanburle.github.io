'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "dc9aa07b657e5ff83f6aa0bb56865497",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"main.dart.js": "4d1bc7d6b70622cfc9cba73136814160",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/NOTICES": "3fa8d9b9a7cb14557ee4a3f712d02e79",
"assets/assets/fonts/Roboto-Thin.ttf": "66209ae01f484e46679622dd607fcbc5",
"assets/assets/images/proteomic_home.png": "7d5b0cfa279910ccb67cb7ac2ad65eca",
"assets/assets/images/peptidesynth_home.png": "998166afb3f337ba89d109beadb2ad1f",
"assets/assets/images/genesynth_genes.png": "81d0ea5b2d4cc1a1f996772edfcf4ac3",
"assets/assets/images/logos_31x40.png": "abcf708d8f1e9d31344cfcc080b1cb09",
"assets/assets/images/benson_logo.png": "a29c808ac482c198c693845b9ffade76",
"assets/assets/images/multiomica_home.jpg": "8ca57942effa9b8f96e1768012325ca7",
"assets/assets/images/genone_2_home.jpg": "73582f5068ce78cd21282e64f771a84b",
"assets/assets/images/metagenomics_home.png": "c355a145a68d42fd9e2cda9607664816",
"assets/assets/images/ciencia_2_home.webp": "2adc0cd0aef39389b3ccf1bd065d5570",
"assets/assets/images/person_home_ciencia.png": "d95f80dfa61ddd047480c7ee03f17663",
"assets/assets/images/real_time_primers_logo.png": "8375368006c889cf87e0ca196fbabe44",
"assets/assets/images/logo_genone_biotec.png": "98df85f7c2707b7122c89b9fec220d57",
"assets/assets/images/icon_biotech.png": "ab02eb551276fafda3aec94896646d09",
"assets/assets/images/dna_home.png": "c3c2d353b121f06f1a03471167be5f29",
"assets/assets/images/logos_41x50.png": "897bd0e4826622553bd5a87322afcdbf",
"assets/assets/images/logo_genone_biotec_m.png": "af662c72528708dd23eb08274cc97607",
"assets/assets/images/biomoleculas_genone_biotech.jpg": "bf93a1693017fdc773fdd8f29175800c",
"assets/assets/images/logos_11x20.png": "70a9173f2ed458eaa8abe7a83545fcff",
"assets/assets/images/logos_51x60.png": "14bc92653139eb479171a84af859961a",
"assets/assets/images/oligosynth_home.png": "2562de902b8d7dc15e644aeff899d63b",
"assets/assets/images/logos_1x10.png": "3a4f143f0aed6ca7f8ab6d58e3891680",
"assets/assets/images/multiomica_genone_home.jpg": "0b75a2a938c9a7058379b5777286b17c",
"assets/assets/images/genTegra_logo.png": "d1e9a2319942de2e7267afe1ed1efd68",
"assets/assets/images/logos_21x30.png": "53905ab1dbb58f9f0e20319575d85c23",
"assets/shaders/ink_sparkle.frag": "7cca31c4eea053a2acce7844c03164e5",
"assets/FontManifest.json": "2163be9a33a2fa5db1a1a199fb0e84e3",
"assets/AssetManifest.json": "7082b9559ae944585ff56b3e9dffc251",
"icons/Icon-maskable-192.png": "d41d8cd98f00b204e9800998ecf8427e",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "d41d8cd98f00b204e9800998ecf8427e",
"index.html": "6d7881edddec985bca7ff00cd38e58f5",
"/": "6d7881edddec985bca7ff00cd38e58f5",
"version.json": "aa9a101ba816c37ab37c17de12871890"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
