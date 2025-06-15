import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button, Input } from "@mui/material";
import { useState } from "react";
import { updateElement } from "../api/elements";
import { Game, Manga } from "../api/types";

interface BaseModal {
  category: string;
  text: string;
}

interface PriceModal extends BaseModal {
  type: "price";
  category: string;
  game: Game;
}
interface RatingModal extends BaseModal {
  type: "rating";
  category: string;
  data: Game | Manga;
}

export type ModalType = PriceModal | RatingModal;

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
  state?: ModalType;
  onClose: () => void;
}

export default function ModalInput({ state, onClose }: Props) {
  const [inputValue, setInputValue] = useState<string | undefined>();

  function validate() {
    if (state?.type === "price") {
      updateElement({
        data: {
          category: state.category,
          item: {
            ...state.game,
            status: inputValue ? "owned" : "not-owned",
            price: inputValue ? Number(inputValue) : undefined,
          },
        },
      });
    } else if (state?.type === "rating") {
      updateElement({
        data: {
          category: state.category,
          item: {
            ...state.data,
            rating: inputValue ? Number(inputValue) : undefined,
          },
        },
      });
    }
    onClose();
  }

  return (
    <div>
      <Modal
        open={!!state}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {state?.text}
          </Typography>
          <Input onChange={(e) => setInputValue(e.currentTarget.value)} />
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
