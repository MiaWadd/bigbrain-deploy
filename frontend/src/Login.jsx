import { useState } from 'react';

import RegisterLogin from './RegisterLogin';
function Login({ successJob, token }) {
  return <RegisterLogin successJob={successJob} token={token} name="login" />
}

export default Login;