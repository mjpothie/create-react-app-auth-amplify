// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {useEffect, useState, Fragment} from "react";
import Amplify, {Auth, Hub} from "aws-amplify";
import {Container} from "react-bootstrap";

import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";

Amplify.configure({
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_Io92oXTkk",
    userPoolWebClientId: "2em0ieao2je2jou8u345b9vci5",
    oauth: {
      domain: "kendrapoc.auth.us-east-1.amazoncognito.com",
      scope: ["email", "openid", "aws.cognito.signin.user.admin", "profile"],
      redirectSignIn: "https://federated-login.dby7lc1axthd.amplifyapp.com",
      redirectSignOut: "https://federated-login.dby7lc1axthd.amplifyapp.com",
      responseType: "code"
    }
  },
  API: {
    endpoints: [
      {
        name: "MyBlogPostAPI",
        endpoint: "<enter here the API gateway endpoint url>"
      }
    ]
  }
});

const federatedIdName =
  "Auth0";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
