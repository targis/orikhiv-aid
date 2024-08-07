import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import { useField } from 'formik'

export default function SelectInput({ withNone = false, ...props }) {
  const { name, label, options } = props
  const [field, meta] = useField(name)

  return (
    <FormControl
      sx={{ mb: 2, textAlign: 'left' }}
      fullWidth
      error={meta.touched && Boolean(meta.error)}
    >
      <InputLabel id={'select-label-' + name}>{label}</InputLabel>
      <Select
        {...field}
        {...props}
        labelId={'select-label-' + name}
        id={'simple-select' + name}
        name={name}
        label={label}
        value={meta.value}
      >
        {withNone && (
          <MenuItem value="">
            <em>Немає</em>
          </MenuItem>
        )}

        {options.map((option, i) => (
          <MenuItem key={i} value={option?.id ? option?.id : option}>
            {option?.label ? option?.label : option}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{(meta.touched && meta.error) || ' '}</FormHelperText>
    </FormControl>
  )
}
