# Project 2 - Flights by Country
We’re diving into the world of Google Flights again and want to create an exciting tool to explore the countries that flights arrive from for a specific airport. So an example: We look at London Heathrow airport, flights may arrive from France, Germany, UK itself, and other countries. Here’s how the tool will work:
The user will enter a 3-character airport code, such as SIN for Singapore Changi Airport or LAX for Los Angeles International Airport. The tool will query the FlightAPI.io API and display a table with two columns (see third page):
1. Country – The country flights are arriving from.
2. #of Flights – The number of flights originating from that country and arriving at the entered airport.
The API will use the default setting of "today" for flight arrivals.

## Requirements
Include a form for the user to input a 3-character airport code.
Query the Airport Schedule API from FlightAPI.io (https://api.flightapi.io/compschedule). You can sign up for a free API key.
Display the results in a table with two columns: Country and # of Flights.
Host the tool on a service of your choice (e.g., Vercel, Render.com, GitHub Pages, etc.) so it is publicly accessible.

## Submission Instructions
Share the source code via a GitHub repository (or another version control platform).
Provide a public link to the hosted tool.

## Flights API
https://docs.flightapi.io/airport-schedule-api
API documentation could be better.

## Notes
1. Use your own Flights API key by storing it in Local or Session storage.
2. The Flights API response contains records for multiple days, even when requesting data only for today.
3. Flights filtered to count only those arriving today, based on the destination airport's local timezone.
4. Compare data with SIN airport arrivals: https://www.changiairport.com/en/fly/flight-information/arrivals.html

## Deployed at
https://flalex.github.io/mp-flights-by-country/
