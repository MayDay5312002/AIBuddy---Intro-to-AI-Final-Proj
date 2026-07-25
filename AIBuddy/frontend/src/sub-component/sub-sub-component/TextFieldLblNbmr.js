import React from 'react';
import { useState } from 'react';
import { Box, TextField, InputBase, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


function TextFieldLblNmbr({ labelTab, valueTab, onChangeTab, min = 1, ...textFieldProps }) {
  const [inputValue, setInputValue] = useState(String(valueTab));

  const clamp = (num) => {
    if (isNaN(num)) return min;
    return Math.max(min, num);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow empty string while typing so users can clear and retype
    if (raw === '') {
      setInputValue('');
      return;
    }
    // Block non-numeric characters (extra safety beyond type="number")
    if (!/^\d*$/.test(raw)) return;
    if (/^0+$/.test(raw)) return; 

    setInputValue(raw);
  };

  const commitValue = () => {
    const clamped = clamp(Number(inputValue));
    setInputValue(String(clamped));
    onChangeTab(clamped);
  };

  const commit = (num) => {
    const clamped = clamp(num);
    setInputValue(String(clamped));
    onChangeTab(clamped);
  };
  const increment = () => commit((Number(inputValue) || min - 1) + 1);
  const decrement = () => commit((Number(inputValue) || min + 1) - 1);

  return (
    <Box sx={{ position: 'relative', mt: {xs: "1rem",md: '1.5rem'} }}>
        <Box
          sx={{
            position: 'absolute',
            top: {xs: "-12px",md:'-18px'},
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            bgcolor: 'background.paper',
            px: '8px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            zIndex: 0,
          }}
        >
            <Box component="span" sx={{ fontSize: {xs: "0.65rem", md:'0.8rem'}, color: 'text.secondary' }}>
              {labelTab}
            </Box>
            <InputBase
              value={inputValue}
              onChange={handleChange}
              onBlur={commitValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitValue();
                  e.target.blur();
                }else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  increment();
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  decrement();
                }
              }}
              sx={{fontSize: {xs: "0.75rem",md: "1rem"}}}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { width: '2.5em', textAlign: 'center', padding: '2px 0' },
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0, transform: "translateY(-2px)"}}>
              <IconButton size="small" onClick={increment}  sx={{ p: 0, height: '10px', width: '18px', borderRadius: 0 }}>
                <KeyboardArrowUpIcon sx={{ fontSize: '14px' }} />
              </IconButton>
              <IconButton size="small" onClick={decrement} disabled={Number(inputValue) <= min} sx={{ p: 0, height: '10px', width: '18px', borderRadius: 0 }}>
                <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
              </IconButton>
            </Box>
        </Box>
        {/* <Box
        sx={{
            position: 'absolute',
            top: '-17px',
            left: '190px',
        }}
        > */}
            {/* <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0 }}>
              <IconButton size="small" onClick={increment}  sx={{ p: 0, height: '14px', width: '18px', borderRadius: 0 }}>
                <KeyboardArrowUpIcon sx={{ fontSize: '14px' }} />
              </IconButton>
              <IconButton size="small" onClick={decrement} disabled={Number(inputValue) <= min} sx={{ p: 0, height: '14px', width: '18px', borderRadius: 0 }}>
                <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
              </IconButton>
            </Box> */}
        {/* </Box> */}

        <TextField variant="outlined" fullWidth {...textFieldProps} />
    </Box>
  );
}

export default TextFieldLblNmbr;