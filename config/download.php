<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Download Link Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for secure download links and download limits.
    |
    */

    'link_expiration' => env('DOWNLOAD_LINK_EXPIRATION', 60), // minutes

    'rate_limit' => env('DOWNLOAD_RATE_LIMIT', 5), // downloads per hour

    'private_disk' => env('DOWNLOAD_DISK', 'private'),

];
