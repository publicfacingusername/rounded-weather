export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const allowedOrigin = 'https://roundedweather.com';
		const corsHeaders = {
			'Access-Control-Allow-Origin': allowedOrigin,
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// Handle OPTIONS requests for CORS preflight
		if (request.method === 'OPTIONS') {
			// Ensure the Origin header matches our allowed origin for preflight
			if (request.headers.get('Origin') === allowedOrigin) {
				return new Response(null, {
					status: 204,
					headers: corsHeaders,
				});
			} else {
				// Origin not allowed for preflight
				return new Response('OPTIONS request from disallowed origin', { status: 403 });
			}
		}

		// Optional: Referer check for non-OPTIONS requests
		// const referer = request.headers.get('Referer');
		// if (!referer || !referer.startsWith(allowedOrigin + '/')) {
		//   // Consider how strict you want to be. Could be spoofed.
		//   // return new Response(JSON.stringify({ error: 'Invalid referer' }), {
		//   //   status: 403,
		//   //   headers: { ...corsHeaders, 'content-type': 'application/json' }
		//   // });
		// }
		
		const url = new URL(request.url);
		const zipCode = url.searchParams.get('zip') ?? '10001'; // Default to New York City
		const country = url.searchParams.get('country') ?? 'us'; // Default country code
		
		try {
			// First API call: Get coordinates from zip code
			const geoResponse = await fetch(
				`http://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(zipCode)},${country}&appid=${env.OPENWEATHER_KEY}`
			);
			
			if (!geoResponse.ok) {
				return new Response(JSON.stringify({ error: 'Location not found' }), {
					status: 404,
					headers: { 
						'content-type': 'application/json',
						...corsHeaders 
					}
				});
			}
			
			const geoData = await geoResponse.json() as GeocodingResponse;
			const { lat, lon } = geoData;
			
			// Second API call: Get weather data with coordinates
			const weatherResponse = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.OPENWEATHER_KEY}`
			);
			
			// Forward the response from OpenWeatherMap, adding our CORS headers
			const responseHeaders = { ...weatherResponse.headers, ...corsHeaders, 'content-type': 'application/json' };
			// Ensure existing headers like content-type from weatherResponse are not overwritten by corsHeaders default if not specific enough
			// For this specific API, we know it is JSON, so explicitly setting content-type after spreading is fine.
			
			return new Response(weatherResponse.body, {
				status: weatherResponse.status,
				headers: responseHeaders
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
				status: 500,
				headers: { 
					'content-type': 'application/json',
					...corsHeaders 
				}
			});
		}
	}
};

interface Env {
	OPENWEATHER_KEY: string;
}

interface GeocodingResponse {
	zip: string;
	name: string;
	lat: number;
	lon: number;
	country: string;
}
  