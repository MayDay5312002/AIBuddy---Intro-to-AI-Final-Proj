import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, Paper} from '@mui/material';
// import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
// import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import ModalModifyMsg from './ModalModifyMsg.js';
import NumberField from './sub-sub-component/NumberField.js';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ApiKeyInput from './sub-sub-component/ApiKeyInput.js';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "80vw",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


export default function ModalSettings({
  aiSpace, setAiSpace, temperature, setTemperature, topP, setTopP, maxTokens, setMaxTokens, api, setApi, oldData, setOldData
  , modelName, setModelName, baseUrl, setBaseUrl, leftSection}) {


  const [open, setOpen] = useState(false);

  
  const id = React.useId();


  const handleOpen = () => {
    setOpen(true);
    getSettings();
  }


  const handleClose = () => {
    setOpen(false);
    // setAiSpace("Ollama");
    getSettings();
    if (aiSpace !== "Ollama") {
      if (api === "") {
        setAiSpace("Ollama");
      }
    }
  }

  // useEffect(() => {
  //   getSettings();
  // }, [aiSpace])
  


  const getSettings = async () => {
    axios.get("http://127.0.0.1:4192/api/getSettings/")
    .then((response) => {
      // console.
      setTemperature(response.data["message"]["temperature"]);
      setTopP(response.data["message"]["topP"]);
      setMaxTokens(response.data["message"]["maxTokens"]);
      setApi(response.data["message"]["apiKey"]);
      setBaseUrl(response.data["message"]["baseUrl"]);
      setModelName(response.data["message"]["modelName"]);
      setAiSpace(response.data["message"]["aiSpace"]);
      setOldData({
        temperature: response.data["message"]["temperature"],
        topP: response.data["message"]["topP"],
        maxTokens: response.data["message"]["maxTokens"],
        api: response.data["message"]["apiKey"],
        baseUrl: response.data["message"]["baseUrl"],
        modelName: response.data["message"]["modelName"],
        aiSpace: response.data["message"]["aiSpace"],
      })
      // console.log(oldData);
    })
  }
  const handleSettingSave = async () => {
    axios.post("http://127.0.0.1:4192/api/updateSettings/", {"temperature": temperature, "topP": topP, "maxTokens": maxTokens, "apiKey": api, "aiSpace": aiSpace,
      "baseUrl": baseUrl, "modelName": modelName
    })
    .then((response) => {
      setApi(response.data["message"]["apiKey"])
      setMaxTokens(response.data["message"]["maxTokens"]);
      setTemperature(response.data["message"]["temperature"]);
      setTopP(response.data["message"]["topP"]);
      setBaseUrl(response.data["message"]["baseUrl"]);
      setModelName(response.data["message"]["modelName"]);
      setAiSpace(response.data["message"]["aiSpace"]);
      setOldData({
        temperature: response.data["message"]["temperature"],
        topP: response.data["message"]["topP"],
        maxTokens: response.data["message"]["maxTokens"],
        api: response.data["message"]["apiKey"],
        baseUrl: response.data["message"]["baseUrl"],
        modelName: response.data["message"]["modelName"],
        aiSpace: response.data["message"]["aiSpace"],
      })
    })
    .catch((error) => {
      console.log(error);
    });
    
    // handleClose();
  }
  const handleSettingsReset = async () => {
    axios.post("http://127.0.0.1:4192/api/updateSettings/", {"temperature": null, "topP": null, "maxTokens": null, "apiKey": "" , "aiSpace": "Ollama"
      , "baseUrl": null, "modelName": null})
    .then((response) => {
      setApi(response.data["message"]["apiKey"])
      setMaxTokens(response.data["message"]["maxTokens"]);
      setTemperature(response.data["message"]["temperature"]);
      setTopP(response.data["message"]["topP"]);
      setAiSpace(response.data["message"]["aiSpace"]);
      setModelName(response.data["message"]["modelName"]);
      setBaseUrl(response.data["message"]["baseUrl"]);
      setOldData({
        temperature: response.data["message"]["temperature"],
        topP: response.data["message"]["topP"],
        maxTokens: response.data["message"]["maxTokens"],
        api: response.data["message"]["apiKey"],
        baseUrl: response.data["message"]["baseUrl"],
        modelName: response.data["message"]["modelName"],
        aiSpace: response.data["message"]["aiSpace"],
      })
    })
    .catch((error) => {
      console.log(error);
    });
    
  }



  const apiCheck = () => {
    if (aiSpace === "Ollama") {
      if (topP === oldData.topP && temperature === oldData.temperature && maxTokens === oldData.maxTokens && aiSpace === oldData.aiSpace) {
        return true;
      }
      return false;
    }
    else{
      if (api === ""){
        return true;
      }
      if (!modelName){
        return true;
      }

      if (!baseUrl){
        return true;
      }
      
      if (topP === oldData.topP && temperature === oldData.temperature && maxTokens === oldData.maxTokens && api === oldData.api && aiSpace === oldData.aiSpace 
        && baseUrl === oldData.baseUrl && modelName === oldData.modelName) 
      {
        return true;
      }
      return false;
    }
    
  }

  
  

  


  return (
    // <Box  sx={{position: "absolute", right: 7, top: 5, zIndex: 2}}>
    <Box
    sx={{
      // mt: "auto",
      pb: "0.3em"
    }}
    >
      <Box sx={{display: 'flex', justifyContent: 'center'}}>
        {!leftSection ? 
        <IconButton onClick={handleOpen}>
          <SettingsIcon sx={{color: 'rgb(71, 69, 69)', fontSize: {xs: "0.9em", md: "1em"}}}/>
        </IconButton>
        :
        <Button variant="contained"onClick={handleOpen} sx={{width: "100%", fontSize: {xs: "0.6rem",md:"0.875rem"}}}>Settings</Button>}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
        sx={{
          ...style, 
          borderRadius: 2, 
          border: "none", 
          width: {xs:"80vw", sm: "60vw", lg: "40vw"},

        }}>
            <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500, fontSize: {xs: "1.3rem", md: "1.5rem"}}}>
            Settings
          </Typography>
          <Divider sx={{my: 1}}/>

          <Paper 
          sx=
          {{p: 1,
           maxHeight: {xs:"60vh", md: "75vh"},
           overflow: "auto"
           }}>
            {/* <div><IconButton onClick={handleSettingsReset} sx={{}}><RestartAltIcon /></IconButton></div> */}
            <Button onClick={handleSettingsReset} variant="contained" sx={{display: "block", mb: "1em", fontSize: {xs: "0.6rem", md:"0.78rem"}}}>Reset</Button>
            <FormControl>
              {/* <FormLabel id={`${id}-label`}>AI Space</FormLabel> */}
              <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1rem", md: "1.25rem"}}}>API Space</Typography>
              <RadioGroup 
              row 
              aria-labelledby={`${id}-label`} 
              name="row-radio-buttons-group"
              // defaultValue="Ollama"
              value={aiSpace}
              onChange={(e) => setAiSpace(e.target.value)}
              >
                <FormControlLabel value="Ollama" control={<Radio />} label="Offline Ollama" />
                {/* <FormControlLabel value="OpenAI" control={<Radio />} label="OpenAI" /> */}
                <FormControlLabel value="Other AI Space" control={<Radio />} label="Other AI Space" />
              </RadioGroup>
            </FormControl>

            {/* {aiSpace === "Ollama" || aiSpace === "OpenAI" || aiSpace === "Common AI Space" && */}
            {aiSpace !== "Ollama" &&
            <div>
              <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1rem", md: "1.25rem"}}}>API Key (Required)</Typography>
              <ApiKeyInput api={api} setApi={setApi}/>

              <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1rem", md: "1.25rem"}, mt: "0.5em"}}>Model Name (Required)</Typography>
              <TextField 
              id="Card Model" 
              // label="Model name" 
              value={modelName} 
              onChange={(e) => setModelName(e.target.value)} 
              variant="outlined" 
              sx={{pb: "0.5em"}} 
              required 
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                },
              }}/>

              <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1rem", md: "1.25rem"}, mt: "0.5em"}}>Base URL (Required)</Typography>
              <TextField 
              id="Card Base URL" 
              // label="Base URL" 
              value={baseUrl} 
              onChange={(e) => setBaseUrl(e.target.value)} 
              variant="outlined" 
              sx={{
                pb: "1em",
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                }

              }} 
          
              required 
              fullWidth/>
            </div>
            }
            <div>
              <NumberField 
              label="Temperature" 
              min={0.1} 
              max={1.0} 
              onValueChange={(e) => setTemperature(e)} 
              value={temperature}
              sx={{width:"100%"}}
              step={0.1}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                },
                // mt: "0.5em"
              }}
              />

              <NumberField 
              label="Max Tokens" 
              min={1} 
              onValueChange={(e) => setMaxTokens(e)} 
              value={maxTokens}
              sx={{width:"100%"}}
              step={1}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                },
                mt: "0.5rem"
              }}
              />

              <NumberField 
              label="Top P" 
              min={0.1} 
              max={1.0} 
              onValueChange={(e) => setTopP(e)} 
              value={topP}
              sx={{width:"100%"}}
              step={0.1}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                },
                mt: "0.5rem"
              }}
              fullWidth
              />
            </div>
            {/* } */}

            <Button 
            disabled={apiCheck()} 
            onClick={handleSettingSave} 
            variant='contained' 
            sx={{mt: "1em", fontSize: {xs: "0.6rem", md:"0.78rem"}}}
            >
            Save
            </Button>
            
            
          </Paper>
      
          
          
        
        </Box>
      </Modal>
    </Box>
  );
}