import { Button, Card, Grid } from '@aws-amplify/ui-react';
import React from 'react';

export const ChatClient = (props) => {
  return (
    <Grid columnGap="0.5rem" rowGap="0.5rem" templateColumns="1fr 1fr 1fr" templateRows="1fr 3fr 1fr">
      <Card columnStart="1" columnEnd="2">
        <ul component="nav">
          {props.members.map((item) => (
            <li
              key={item.connectionId}
              onClick={() => {
                props.onPrivateMessage(item.email, item.connectionId);
              }}
              button
            >
              <span style={{ fontWeight: 800 }}>{item.email}</span>
            </li>
          ))}
        </ul>
        {props.isConnected && (
          <Button
            style={{ marginRight: 7 }}
            variant="outlined"
            size="small"
            disableElevation
            onClick={props.onPublicMessage}
          >
            Send Public Message
          </Button>
        )}
        {props.isConnected && (
          <Button variant="outlined" size="small" disableElevation onClick={props.onDisconnect}>
            Disconnect
          </Button>
        )}
        {!props.isConnected && (
          <Button variant="outlined" size="small" disableElevation onClick={props.onConnect}>
            Connect
          </Button>
        )}
      </Card>
      <Card columnStart="2" columnEnd="-1">
        <ul
          style={{
            paddingTop: 20,
            paddingLeft: 44,
            listStyleType: 'none',
          }}
        >
          {props.chatRows.map((item, i) => (
            <li key={i} style={{ paddingBottom: 9 }}>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </Grid>
  );
};
