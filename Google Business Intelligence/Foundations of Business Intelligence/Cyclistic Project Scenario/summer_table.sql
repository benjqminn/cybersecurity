SELECT
 TRI.usertype,
 TRI.start_station_longitude,
 TRI.start_station_latitude,
 TRI.end_station_longitude,
 TRI.end_station_latitude,
 ZIPSTART.zip_code AS zip_code_start,
 ZIPSTARTNAME.borough borough_start,
 ZIPSTARTNAME.neighborhood AS neighborhood_start,
 ZIPEND.zip_code AS zip_code_end,
  ZIPENDNAME.borough borough_end,
  ZIPENDNAME.neighborhood AS neighborhood_end,
  DATE_ADD(DATE(TRI.starttime), INTERVAL 5 YEAR) AS start_day,
 DATE_ADD(DATE(TRI.stoptime), INTERVAL 5 YEAR) AS stop_day,
  WEA.temp AS day_mean_temperature, 
 WEA.wdsp AS day_mean_wind_speed, 
  WEA.prcp day_total_precipitation, 
ROUND(CAST(TRI.tripduration / 60 AS INT64), -1) AS trip_minutes,
 TRI.bikeid
FROM  
 `bigquery-public-data.new_york_citibike.citibike_trips` AS TRI
INNER JOIN
`bigquery-public-data.geo_us_boundaries.zip_codes` ZIPSTART
ON ST_WITHIN(
ST_GEOGPOINT(TRI.start_station_longitude, TRI.start_station_latitude),
 ZIPSTART.zip_code_geom)
INNER JOIN
`bigquery-public-data.geo_us_boundaries.zip_codes` ZIPEND
ON ST_WITHIN(
 ST_GEOGPOINT(TRI.end_station_longitude, TRI.end_station_latitude),
ZIPEND.zip_code_geom)
INNER JOIN
 `bigquery-public-data.noaa_gsod.gsod20*` AS WEA
 ON PARSE_DATE("%Y%m%d", CONCAT(WEA.year, WEA.mo, WEA.da)) = DATE(TRI.starttime)
INNER JOIN
`legalbi.sandbox.zipcodes` AS ZIPSTARTNAME
ON ZIPSTART.zip_code = CAST(ZIPSTARTNAME.zip AS STRING)
INNER JOIN
  `legalbi.sandbox.zipcodes` AS ZIPENDNAME
   ON ZIPEND.zip_code = CAST(ZIPENDNAME.zip AS STRING)
WHERE
  WEA.wban = '94728' 
AND DATE(TRI.starttime) BETWEEN DATE('2015-07-01') AND DATE('2015-09-30')
