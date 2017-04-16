export interface EventfulEventParams {
  keywords?: string;
  location?: string;
  date?: string;
  category?: string;
  ex_category?: string;
  within?: number;
  units?: "km"|"mi";
  count_only?: boolean;
  sort_order?: 'popularity'|'date'|'relevance';
  sort_direction?: 'ascending'|'descending';
  page_size?: number;
  page_number?: number;
  image_sizes?: string;
  mature?: 'all'|'normal'|'safe';
  include?: string;
  change_multi_day_start?: boolean;
}

export interface EventfulEventResult {
  total_items?: number;
  page_number?: number;
  page_size?: number;
  page_count?: number;
  events?: {event?: EventfulEvent[]}
}

export interface EventfulEvent {
  id?: string;
  url?: string;
  city_name: string;
  watching_count?: number;
  olson_path?: string;
  calendar_count?: number;
  comment_count?: number;
  region_abbr?: string;
  postal_code?: string;
  going_count?: number;
  all_day?: string;
  latitude?: string;
  groups?: string;
  privacy?: string;
  link_count?: string;
  longitude?: string;
  country_name?: string;
  country_abbr?: string;
  region_name?: string;
  start_time?: string;
  tz_id?: string;
  description?: string;
  modified?: string;
  venue_display?: string;
  tz_country?: string;
  performers?: {
    performer?: {
      creator?: string;
      linker?: string;
      name?: string;
      url?: string;
      id?: string;
      short_bio?: string;
    }
  };
  title?: string;
  venue_address?: string;
  geocode_type?: string;
  tz_olson_path?: string;
  recur_string?: string;
  calendars?: string;
  owner?: string;
  going?: string;
  country_abbr2?: string;
  image?: string;
  created?: string;
  venue_id?: string;
  tz_city?: string;
  stop_time?: string;
  venue_name?: string;
  venue_url?: string;
}
