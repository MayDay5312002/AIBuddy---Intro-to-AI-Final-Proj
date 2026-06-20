import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function ApiKeyInput({api, setApi}) {
  const [showKey, setShowKey] = useState(false);
//   const [apiKey, setApiKey] = useState('');

  const handleClickShowKey = () => {
    // console.log(api);
    // console.log(setApi);
    setShowKey(!showKey);
  }

  return (
    <TextField
      fullWidth
      label="API Key"
      variant="outlined"
      type={showKey ? 'text' : 'password'}
      value={api}
      onChange={(e) => setApi(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleClickShowKey} edge="end">
              {showKey ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
