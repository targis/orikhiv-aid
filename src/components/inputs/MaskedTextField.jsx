import { TextField } from '@mui/material'
import { useField } from 'formik'
import { PatternFormat } from 'react-number-format'

const MaskedTextField = ({
  name,
  label,
  format,
  mask,
  formatResult,
  ...props
}) => {
  const [field, meta, helpers] = useField(name)
  const sx = props?.sx || null

  return (
    <PatternFormat
      // {...field}
      {...props}
      id={`input-${name}`}
      name={name}
      label={label}
      format={format}
      mask={mask}
      value={field.value}
      onValueChange={(values) => {
        const val = formatResult ? values.formattedValue : values.value
        helpers.setValue(val)
      }}
      customInput={TextField}
      sx={sx ? { sx } : { mb: 2 }}
      variant="outlined"
      error={meta.touched && Boolean(meta.error)}
      helperText={(meta.touched && meta.error) || ' '}
      fullWidth
    />
  )
}

export default MaskedTextField