import React, { useContext } from 'react'
import SessionContext from './SessionContext'
import ExternalLink from './ExternalLink'

export default function AccountPage(props) {
  const { session } = useContext(SessionContext)

  return (
    <article className="Session-content">
      <h2>{session.account.accountDisplayName} @{session.account.username}</h2>
      <p>{session.profile.description.bio}</p>
      <p>Location: {session.profile.description.location || "(none)"}</p>
      <p><span>Website: </span>
        {(session.profile.description.website && (
          <ExternalLink href={session.profile.description.website}>
            {session.profile.description.website}
          </ExternalLink>
        )) || (
          "(none)"
        )}
      </p>
      <h3>Account Information</h3>
      <dl>
        <dt>Email</dt>
        <dd>{session.account.email}</dd>
        <dt>Phone Number</dt>
        <dd>{session.account.phoneNumber}</dd>
        <dt>Account ID</dt>
        <dd>{session.account.accountId}</dd>
        <dt>Account Created</dt>
        <dd>{session.account.createdDate.toLocaleString()}</dd>
        <dt>IP used to create account</dt>
        <dd>{session['account-creation-ip'][0].accountCreationIp.userCreationIp}</dd>
        <dt>Timezone</dt>
        <dd>{session['account-timezone'][0].accountTimezone.timeZone}</dd>
        <dt>Age</dt>
        <dd>{session.ageinfo[0].ageMeta.ageInfo.age}</dd>
        <dt>Birthdate</dt>
        <dd>{new Date(session.ageinfo[0].ageMeta.ageInfo.birthDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</dd>
        <dt>Verified</dt>
        <dd>{session.verified.verified ? "Yes" : "No"}</dd>
      </dl>
      <h3>Demographics</h3>
      <dl>
        <dt>Inferred gender</dt>
        <dd>{session.personalization[0].p13nData.demographics.genderInfo.gender}</dd>
        <dt>Override gender</dt>
        <dd>{session.personalization[0].p13nData.demographics.genderInfo.genderOverride}</dd>
        <dt>Inferred languages</dt>
        <dd>
          <ul>
            {session.personalization[0].p13nData.demographics.languages.map(({language, isDisabled}, index) => (
              <li key={index}>{language}{isDisabled ? " (Disabled)" : ""}</li>
            ))}
          </ul>
        </dd>
        <dt>Inferred age</dt>
        <dd>{session.personalization[0].p13nData.inferredAgeInfo.age.join(', ')}</dd>
        <dt>Locations</dt>
        <dd>
          <ul>
            {session.personalization[0].p13nData.locationHistory.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        </dd>
      </dl>
    </article>
  )
}
