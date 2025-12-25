import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { NavLink } from "react-router-dom"
import Section from "./layout/Section"

const RegisterClosed = () => {
  return (
    <Section maxWidth={"sm"}>
      <Typography>
        З 06.03.2023 онлайн реєстрацію ВПО в гуманітарній базі призупинено <br /><br />

        На даний час реєстрація доступна лише особисто:<br />
        м. Запоріжжя, вул. Незалежної України, буд. 43А, другий поверх.<br /><br />

        {/* <Button
          variant="contained"
          color="primary"
          size="small"
          component={NavLink}
          to={'/orikhiv-aid/reminder'}>
          Нагадати номер
        </Button> */}

      </Typography>
    </Section>

  )
}

export default RegisterClosed