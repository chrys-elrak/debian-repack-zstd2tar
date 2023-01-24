import { Alert, AlertColor, Snackbar } from '@mui/material';
type AlertPopupProps = {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    message: string;
    severity: AlertColor;
}
export default function AlertPopup({ setOpen, open, message, severity }: AlertPopupProps) {
    function handleClose() {
        setOpen(false);
    }

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                { message }
            </Alert>
        </Snackbar>
    )
}
