import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button, Input } from "@mui/material";
import { useState } from "react";
import { addElement } from "../api/elements";
import { Category } from "../api/types";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface Props {
  category?: Category;
  isOpen?: boolean;
  onClose: () => void;
  onValidate: () => void;
}

export default function ModalAdd({
  category,
  isOpen,
  onClose,
  onValidate,
}: Props) {
  const [inputName, setInputName] = useState<string | undefined>();

  function validate() {
    if (category) {
      addElement({
        data: {
          category: category.id,
          item: {
            id: crypto.randomUUID(),
            name: inputName || "",
            status: "not-owned",
          },
        },
      });
      onValidate();
      onClose();
    }
  }

  return (
    <div>
      <Modal
        open={isOpen || false}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add a new game
          </Typography>
          <Input onChange={(e) => setInputName(e.currentTarget.value)} />
          <div style={{ display: "flex" }}>
            <Button style={{ marginLeft: "auto" }} onClick={onClose}>
              Close
            </Button>
            <Button onClick={validate}>Validate</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
