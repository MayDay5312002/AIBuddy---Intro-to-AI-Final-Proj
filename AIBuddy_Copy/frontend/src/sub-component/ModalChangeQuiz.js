import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, List, ListItem} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CloseIcon from '@mui/icons-material/Close';



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


export default function ModalChangeQuiz({oldAnswer,oldQuestion, oldChoices, setQuizzes, quizzes, thread_title, id_quiz}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setQuestion(oldQuestion);
    setChoices(oldChoices);
    setAnswer(oldAnswer);
    setOpen(false);
  }

  //use state for current variables
  const [ question , setQuestion] = useState(oldQuestion);
  const [ choices, setChoices] = useState(oldChoices); 
  const [ answer , setAnswer] = useState(oldAnswer);

  useEffect(() => {
    setQuestion(oldQuestion);
    setChoices(oldChoices);
    setAnswer(oldAnswer);
  }, [oldQuestion, oldChoices, oldAnswer]);

  const handleThread = async () => {
    axios.post("http://127.0.0.1:4192/api/modifyQuizCard/", {"question": question,  "choices": choices, "answer": answer, "thread": thread_title, "id": id_quiz})
    .then((response) => {
      // setQuizzes(quizzes.map(card => card.title === oldTitle ? {...card, title: title, content: content} : card));
      let index = quizzes.findIndex(card => card.id === id_quiz);
      if(index !== -1){
        let updatedquizzes = [...quizzes.slice(0, index), {"question": question, "answer": answer, "choices": choices, "id": id_quiz}, ...quizzes.slice(index + 1)];
        setQuizzes(updatedquizzes);
      }
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
    handleClose();
  }

  const handleDeleteChoice = async (newChoices) => {
    axios.post("http://127.0.0.1:4192/api/deleteChoiceQuiz/", {"question": question, "choices": newChoices, "thread": thread_title})
    .then((response) => {
      setChoices( newChoices );
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
  }

  return (
    <Box component={"span"}>
      <IconButton onClick={handleOpen}><EditIcon /></IconButton>
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
          width: {xs:"80vw", sm: "60vw", md: "40vw"},
          maxHeight: {xs:"80vh", sm: "60vh", md: "70vh"},
          overflow: "auto",

        }}>
          <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Modify Quiz
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
            <Typography variant="h6" component="h2" >Quiz Question</Typography>
            <TextField id="Card Question" label="Card Question" value={question} onChange={(e) => setQuestion(e.target.value)} variant="filled" required fullWidth 
            multiline rows={3}
            />
          </div>

          <div>
            <Typography variant="h6" component="h2"  sx={{mt: "0.5em"}}>Quiz Choices</Typography>
            <IconButton>
              <AddBoxSharpIcon onClick={() => setChoices([...choices, ""])}/>
            </IconButton>
            <List> 
              {choices.map((choice, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    // py: 0,
                  }}
                >
                  <TextField
                    id={`choice-${index}`}
                    label={`Choice ${index + 1}`}
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      if(answer === newChoices[index]) setAnswer(e.target.value);
                      newChoices[index] = e.target.value;
                      setChoices(newChoices);
                    }}
                    variant="filled"
                    required
                    fullWidth
                    multiline
                    rows={1}
                  />
                  <IconButton
                    onClick={() => {
                      // setChoices( choices.filter((_, i) => i !== index) );
                      if(choices.length > 1){
                      let newChoices = choices.filter((_, i) => i !== index);
                      handleDeleteChoice(newChoices);
                      // setQuizzes( [...quizzes.splice(index, 1), {"question": question, "answer": answer, "choices": newChoices}, ...quizzes.splice(index+1)] );
                      }
                    }}
                    sx={{mx: "0.2em"}}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={
                    () => {
                      if(choice !== answer) setAnswer(choice);
                      else setAnswer("");
                    }}>
                    {
                      (choice === answer) ?
                        <CheckCircleIcon sx={{color: "green"}}/> // Right Answer
                      :
                        <DangerousIcon sx={{color: "red"}}/> // Wrong Answer
                    }
                  </IconButton> 
                </ListItem>
              ))

              }
            </List>
          </div>
      
          <div style={{marginTop: "1em"}}>
            <Button 
            disabled={question === oldQuestion && JSON.stringify(choices) == JSON.stringify(oldChoices) && answer === oldAnswer} 
            onClick={handleThread} 
            variant='contained' 
            sx={{my: "1em", fontSize: "0.85em"}}
            >
              Submit
            </Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}