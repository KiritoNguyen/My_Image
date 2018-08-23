// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 

var dataCacheName = 'tank';
var cacheName = 'tankPWA';
var filesToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request)
      .then(function(response) {
        if (response) {
          return response;     // if valid response is found in cache return it
        } else {
          return fetch(e.request)     //fetch from internet
            .then(function(res) {
              return caches.open(cacheName)
                .then(function(cache) {
                  cache.put(e.request.url, res.clone());    //save the response for future
                  return res;   // return the fetched data
                })
            })
           
        }
      })
  );
});   

