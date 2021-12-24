import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DateTime } from "luxon";

const api_url = "https://l0pwb79kge.execute-api.ap-southeast-2.amazonaws.com/sites";

const lessThanADayAgo = date => DateTime.fromISO(date) > DateTime.now().minus({hours: 24});

// const getPosition = data => data.coordinates;
// const getRadius = data => lessThanADayAgo(data.added) ? 2000 : 750; // TODO inverse function of age
// const getFillColor = data => lessThanADayAgo(data.added) ? [255, 0, 0] : [0, 180, 30];
// const getLineColor = data => lessThanADayAgo(data.added) ? [255, 0, 0] : [0, 180, 30];
// const getLineWidth = data => lessThanADayAgo(data.added) ? 2 : 0;
// const mapSiteToPoint = (site) => ({
//   id: `${site.date}#${site.suburb}#${site.advice}#${site.location}#${site.added}`,
//   data: [
//     {
//       ...site,
//       coordinates: [site.data?.longitude, site.data?.latitude]
//     },
//   ],
//   pickable: false,
//   opacity: lessThanADayAgo(site.added) ? 0.3 : 0.05,
//   stroked: true,
//   filled: true,
//   radiusScale: 1,
//   radiusMinPixels: 1,
//   radiusMaxPixels: 100,
//   lineWidthMinPixels: 1,
//   getPosition,
//   getRadius,
//   getFillColor,
//   getLineColor,
//   getLineWidth,
// });

const adviceColours = {
  "Low risk": [0, 0, 200],
  "Casual": [0, 200, 100],
  "Close": [200, 0, 0],
};

const getPosition = data => data.coordinates;
const getRadius = data => 200 + (20 * data.sites.length);
const getFillColor = data => lessThanADayAgo(data.date) ? [0,255,255]: adviceColours[data.highestAdvise]; // [255, 0, 0];
const getLineColor = data => adviceColours[data.highestAdvise]; // [255, 0, 0];
const getLineWidth = data => 1;

const mapPostCodeToPoint = (pc) => ({
  id: pc.suburb,
  data: [
    {
      ...pc,
      coordinates: [pc.longitude, pc.latitude]
    },
  ],
  pickable: false,
  opacity: 0.3 - (pc.sites.length * 0.01),
  stroked: true,
  filled: true,
  radiusScale: 50,
  radiusMinPixels: 1,
  radiusMaxPixels: 100,
  lineWidthMinPixels: 1,
  getPosition,
  getRadius,
  getFillColor,
  getLineColor,
  getLineWidth,
});

const groupSuburbSites = sites => {
  const result = sites.reduce((acc, site) => {
    const {location, address, ...rest} = site;
    if (location) {
      const index = acc.findIndex(s => s.location === location);
      if (index !== -1) {
        acc[index] = {
          ...acc[index],
          mostRecentDate: acc[index].mostRecentDate > rest.date ? acc[index].mostRecentDate : rest.date,
          hits: [...acc[index].hits, rest],
        };
      } else {
        acc.push({
          location,
          address,
          mostRecentDate: rest.date,
          hits: [rest],
        });
      }
    }
    return acc;
  }, [])
  .sort((a, b) => a.mostRecentDate < b.mostRecentDate ? -1 : 1);
  console.log(result);
  return result;
};

const sitesBySuburb = sites => {
  const suburbs = sites.reduce((acc, {site}) => {
    const {data, ...rest} = site;
    if (data) {
      const index = acc.findIndex(s => s.suburb === data.suburb);

      if (index !== -1) {
        acc[index] = {
          ...acc[index],
          sites: [...acc[index].sites, rest],
        };
      } else {
        acc.push({
          ...data,
          sites: [rest],
        });
      }
    }
    return acc;
  }, []);

  return suburbs.map(suburb => ({
    ...suburb,
    sites: groupSuburbSites(suburb.sites),
    mostRecentDate: suburb.sites.reduce((acc, {date}) => {
      return date > acc ? date : acc;
    }, ""),
    mostRecentAdded: suburb.sites.reduce((acc, {added}) => {
      return added > acc ? added : acc;
    }, ""),
    highestAdvise: suburb.sites.reduce((acc, {advice}) => {
      if (advice === "Close") {
        return advice;
      }
      if (advice === "Casual" && acc === "Low risk") {
        return advice;
      }
      return acc;
    }, "Low risk"),
  }));
};

const postCodesToPoints = (items) => {
  return items ? items.map(pc => mapPostCodeToPoint(pc)) : [];
};

const config = {
  method: "get",
  url: api_url,
};

export const useSites = () => {
  const [sites, setSites] = useState([]);

  const getSites = useCallback(async () => {
    const {data} = await axios.get(api_url, config);
    const groupedByPostCode = sitesBySuburb(data.items);
    console.log(groupedByPostCode);
    const postCodePoints = postCodesToPoints(groupedByPostCode);
    // const sitePoints = sitesToPoints(data.items);
    setSites(postCodePoints);
  }, []);

  useEffect(() => {
    getSites()
      .catch(console.error);
    ;
  }, [getSites]);

  return {sites};
};
