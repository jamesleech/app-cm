const Hits = ({hits}) => {
  console.log('hits', hits);
  const hitItems = hits.sort((a,b) => a.date > b.date ? -1 : 1).map((hit) =>
    <li key={`${hit.date}-${hit.advice}`}>
      <p>{hit.dateText}</p>
      <p>{hit.timeText}</p>
      <p>{hit.advice}</p>
    </li>
  );

  return (<ul>{hitItems}</ul>);
};

const Sites = ({sites}) => {
  console.log('sites', sites);
  const siteItems = sites.sort((a,b) => a.mostRecentDate > b.mostRecentDate ? -1 : 1).map((site) =>
    <li key={site.location}>
      <p>{site.location}</p>
      <p>{site.address}</p>
      <Hits hits={site.hits}/>
    </li>
  );

  return (<ul>{siteItems}</ul>);
};

export const SuburbInfo = (props) => {
  return props.suburb ? <div className="Info">
    <h1>{props.suburb} {props.postcode}</h1>
    <Sites sites={props.sites}/>
  </div> : <div/>;
};
