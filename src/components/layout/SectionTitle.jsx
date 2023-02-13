import Typography from "@mui/material/Typography"

const SectionTitle = ({ title = "title" }) => {
  return (
    <Typography component="h2" variant="h4" sx={{ textAlign: "center", mb: 4 }}>{title}</Typography>
  )
}

export default SectionTitle