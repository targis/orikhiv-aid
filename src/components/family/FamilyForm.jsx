import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
// import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import CheckIcon from '@mui/icons-material/Check';
import TextInput from 'components/inputs/TextInput'
import MaskedTextField from 'components/inputs/MaskedTextField'
import SelectInput from 'components/inputs/SelectInput'
import AutocompleteField from 'components/inputs/AutocompliteField'
import FamilyFormSubtitle from 'components/family/FamilyFormSubtitle'
import CheckField from 'components/inputs/CheckField'
import * as yup from 'yup'
import { parseDateString } from 'helpers/date'
import { add } from 'date-fns'
import ScrollToError from 'components/ScrollToError'
import ErrorMessage from './ErrorMessage'
import StreetField from 'components/inputs/StreetField'
import { streets, cities_hromada, vpo_cities, vpo_streets } from 'helpers/toponyms'
import isBefore from 'date-fns/isBefore'
import { action } from 'api'
import Divider from '@mui/material/Divider'

// async function stall(stallTime = 3000) {
//   await new Promise(resolve => setTimeout(resolve, stallTime));
// }

let initialValues = {
  id: 1,
  last_name: '',
  first_name: '',
  middle_name: '',
  born: '',
  tax_number: '',
  document: '',
  tel: '',
  address_city: '',
  address_street: null,
  address_number: '',
  address_corpus: '',
  address_room: '',
  // vpo_address: '',
  vpo_number: '',
  vpo_date: '',
  in_hostel: false,

  has_qr: false,
  disability_group: '',
  is_war_disability: false,
  has_disease: false,
  is_veteran: false,
  is_soldier_family: false,
  fallen_hero_family: false,
  is_poor: false,
  is_single: false,
  is_pensioner: false,
  is_householder: false,
  need_call: false,
  notes: '',

  vpo_city: 'м. Запоріжжя',
  vpo_street: '',
  vpo_bud: '',
  vpo_apartment: '',
}

const disabilityOptions = [
  {
    id: 1,
    label: '1 група'
  },
  {
    id: '1А',
    label: '1А група'
  },
  {
    id: '1Б',
    label: '1Б група'
  },
  {
    id: 2,
    label: '2 група'
  },
  {
    id: 3,
    label: '3 група'
  },
  {
    id: 'ІД',
    label: 'Інвалід дитинства'
  },
]

const minVpoDate = new Date('2022-02-23')
const today = new Date()
const maxBirthdayDate = add(today, { years: -18 })
const passportRegex =
  /^(?:[А-ЩЬЮЯЄІЇҐ]{2,5}\d{6}|\d{9})$/

const phoneNumberRegex = /^0[0-9]{9}$/

const innRegex = /^[0-9]{10}$/
// /\(?([0-9]{3})\)?([0-9]{3})[-. ]?([0-9]{2})[-. ]?([0-9]{2})$/

const vpoBudRegex =
  /^[0-9]{1,4}([/][0-9]{1,4})?([а-яА-ЯіїєІЇЄ])?$/

async function validateValue(name, value) {
  try {
    const data = await fetch(action + '?' + new URLSearchParams({ [name]: value }), {
      method: 'GET'
    }).then(res => res.json())
    const resultFieldName = `is_${name}_valid`
    console.log(data)
    return { [resultFieldName]: data[resultFieldName] }
  } catch (error) {
    return { isValid: false, isLoading: false };
  }
}

const validationSchema = yup.object().shape({
  last_name: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(/^\D+$/, 'Це поле не може містити числа')
    .min(2, 'Дуже коротке прізвище'),
  first_name: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(/^\D+$/, 'Це поле не може містити числа')
    .min(2, "Дуже коротке ім'я"),
  middle_name: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(/^\D+$/, 'Це поле не може містити числа')
    .min(4, 'Це поле має містити щонайменше 4 символи'),
  born: yup
    .date()
    // .nullable().transform((curr, orig) => orig === '' ? null : curr)
    .required("Це поле обов'язкове")
    .transform(parseDateString)
    .typeError('Невірний формат дати: ДД.ММ.РРРР')
    .max(today, 'Невірна дата')
    .when('is_householder', (is_householder, passSchema) => is_householder
      ? passSchema.max(maxBirthdayDate, 'Голова домогосподарства має бути повнолітнім')
      : passSchema
    ),
  tax_number: yup
    .string()
    .when('born', (born, passSchema) => isBefore(born, maxBirthdayDate) ? passSchema
      .required("Це поле обов'язкове")
      .length(10, 'Це поле має містити 10 цифр')
      .matches(
        innRegex,
        'Невірний формат'
      )
      // .test('unique-tax-number', 'Tax number must be unique', function (value) {
      //   const family = this.options.context.family;
      //   return !family.some(person => person.tax_number === value)
      // })
      .test('checkTaxNumber', 'Цей податковий номер вже зареєстрований.', async (value) => {
        if (value && value.length === 10) {
          const { is_tax_number_valid } = await validateValue('tax_number', value)
          return is_tax_number_valid
        } else return false
      })
      : passSchema
    ),
  document: yup
    .string()
    .required("Це поле обов'язкове.")
    .matches(
      passportRegex,
      'Невірний формат. Зразок: СА123456 / 001234567 / ІЖС123456'
    )
    .test('checkDocument', 'Цей документ вже зареєстрований.', async (value) => {
      if (value) {
        const { is_document_valid } = await validateValue('document', value)
        return is_document_valid
      } else return false
    }),
  tel: yup
    .string()
    .when('born', (born, passSchema) => isBefore(born, maxBirthdayDate) ? passSchema
      .required("Це поле обов'язкове")
      .length(10, 'Це поле має містити 10 цифр')
      .matches(
        phoneNumberRegex,
        'Невірний формат номеру, 0661234567'
      )
      : passSchema
    ),
  address_city: yup.string().required("Це поле обов'язкове"),
  address_street: yup.string().required("Це поле обов'язкове"),
  address_number: yup.number().required("Це поле обов'язкове").min(1, 'Мінімальне значення - 1'),
  address_room: yup.number().min(1, 'Мінімальне значення - 1'),
  // vpo_address: yup
  //   .string()
  //   .required("Це поле обов'язкове")
  //   .min(8, 'Введіть повну адресу (місто, вулиця, номер буд./кв.'),
  vpo_number: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(/^\d{4}[-]\d{10}$/, 'Невірний формат (1234-1234567890)')
    .test('checkVpoNumber', 'Ця довідка ВПО вже зареєстрована.', async (value) => {
      if (value) {
        const { is_vpo_number_valid } = await validateValue('vpo_number', value)
        return is_vpo_number_valid
      } else return false
    }),
  vpo_date: yup
    .date()
    .required("Це поле обов'язкове")
    .transform(parseDateString)
    .typeError('Невірний формат дати: ДД.ММ.РРРР')
    .min(minVpoDate, 'Мінімальна дата 24.02.2022')
    .max(today, 'Невірна дата'),
  // is_householder: yup
  //   .boolean(),
  disability_group: yup
    .string()
    .when('is_war_disability', (is_war_disability, passSchema) => is_war_disability ? passSchema
      .required("Це поле обов'язкове, коли стоїть відмітка \"Інвалідність внаслідок війни\"")
      : passSchema
    ),
  vpo_city: yup.string().required("Це поле обов'язкове"),
  vpo_street: yup.string().required("Це поле обов'язкове"),
  vpo_bud: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(vpoBudRegex, 'Невірний формат (зразок: 123 або 123А)'),
  vpo_apartment: yup.number().min(1, 'Мінімальне значення - 1'),
})

// const testVals = {
//   ...initialValues,
//   last_name: 'lastNameTest',
//   first_name: 'firstNameTest',
//   middle_name: 'middleNameTest',
//   born: '10.10.2001',
//   tax_number: '',
//   document: '012345678',
//   tel: '06612312312',
//   // socialStatus: 'відсутній',
//   address_city: 'с.Копані',
//   address_street: 'streetTest1',
//   address_numbrer: '123',
//   vpo_address: 'factAddressTest1',
//   vpo_number: '1234-1234567890',
//   vpo_date: '25.03.2022'
// }

const RegisterForm = ({ submitAction, isHouseholder, personValues = null, closeAction, family, fields }) => {

  const [checkingErrors, setCheckingErrors] = useState(null)
  // const [docsChecked, setDocsChecked] = useState(false)
  // const [docsValidating, setDocsValidating] = useState(false)

  const handleClose = closeAction || (() => { console.log('close') })

  initialValues = personValues
    ? { ...personValues }
    : { ...initialValues, is_householder: isHouseholder }

  /** provide initial data from householder to avoid user adding the same data 
   *  multiple times
  */
  if (!isHouseholder && !personValues) {
    initialValues = {
      ...initialValues,
      vpo_city: family[0].vpo_city,
      vpo_street: family[0].vpo_street,
      vpo_bud: family[0].vpo_bud,
      vpo_corp: family[0].vpo_corp,
      vpo_apartment: family[0].vpo_apartment,
    }
  }

  // const validateDocsFields = async (values, setFieldError) => {
  //   const fieldsToValidate = ['document', 'tax_number', 'vpo_number'];
  //   let validated = 0
  //   for (const field of fieldsToValidate) {
  //     let res = ''
  //     try {
  //       setDocsValidating(true)
  //       res = await validationSchema.validateAt(field, values);
  //       validated += 1
  //       console.log(res)
  //     } catch (err) {
  //       console.log(res)
  //       setFieldError(field, err.message);
  //     } finally {
  //       setDocsValidating(false)
  //     }
  //   }
  //   setDocsChecked(validated === fieldsToValidate.length)
  // };

  return (
    <Box maxWidth={"md"} sx={{ ml: 'auto', mr: 'auto' }}>
      <Typography color="inherit" variant="h6" component="div" sx={{ mb: 4 }}>
        {isHouseholder ? 'Введіть дані голови домогосподарства' : 'Введіть дані члена сім\'ї'}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={async (values) => {
          try {
            const errs = await submitAction(values)
            if (errs) {
              setCheckingErrors(errs)
            } else {
              setCheckingErrors(null)
              handleClose()
            }
          } catch (e) {
            console.log(e)
          }
        }}
      >

        {({ values, handleSubmit, isSubmitting, resetForm, isValidating, isValid, errors, setFieldValue, setFieldError }) => (

          <Form autoComplete="off">
            {fields}
            <FamilyFormSubtitle>Основна інформація</FamilyFormSubtitle>
            <Grid container columnSpacing={2} columns={12}>

              <Grid item xs={12} sm={6}>
                <TextInput
                  name="last_name"
                  label="Прізвище"
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextInput
                  name="first_name"
                  label="Ім'я"
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextInput
                  name="middle_name"
                  label="По-батькові"
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaskedTextField
                  name="born"
                  label="Дата народження"
                  format="##.##.####"
                  mask="_"
                  // type="tel"
                  // valueIsNumericString={true}
                  formatResult={true}
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaskedTextField
                  name="tax_number"
                  label="Ідентифікаційний податковий номер (РНОКПП)"
                  format="##########"
                  type="tel"
                  // mask="_"
                  // valueIsNumericString={true}
                  InputProps={{
                    maxLength: 10,
                    endAdornment: <InputAdornment position="start" disablePointerEvents={true}>
                      {isValidating && (<CircularProgress size="1rem" />)}
                    </InputAdornment>,
                  }}
                  disabled={isValidating}
                  fullWidth

                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextInput
                  name="document"
                  label="Серія і номер паспорта / свідоцтва"
                  InputProps={{
                    maxLength: 9,
                    endAdornment: <InputAdornment position="start" disablePointerEvents={true}>
                      {isValidating && (<CircularProgress size="1rem" />)}
                    </InputAdornment>,
                  }}
                  fullWidth
                  disabled={isValidating}
                  onChange={(e) => {
                    setFieldValue("document", e.target.value.toUpperCase());
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaskedTextField
                  name="tel"
                  label="Номер телефону"
                  type="tel"
                  format="##########"
                  // valueIsNumericString={true}
                  // mask="_"
                  formatResult={true}
                  fullWidth
                  disabled={isValidating}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" disablePointerEvents={true}>
                      +38
                    </InputAdornment>,
                  }}

                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckField name="need_call" label="Необхідно дзвонити?" disabled={isValidating}></CheckField>
              </Grid>

            </Grid>

            <FamilyFormSubtitle>Адреса реєстрації (прописка)</FamilyFormSubtitle>



            <Grid container columnSpacing={2} columns={12}>
              <Grid item xs={12} sm={5}>
                <SelectInput
                  name="address_city"
                  label="Населений пункт"
                  options={cities_hromada}
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={7} sx={{ textAlign: 'left' }}>
                <StreetField name="address_street" label="Вулиця" streets={streets} disabled={isValidating} />
              </Grid>


              <Grid item xs={12} sm={4}>
                <TextInput name="address_number" label="Номер будинку" type="number" disabled={isValidating} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextInput
                  name="address_corpus"
                  label="Корпус"
                  disabled={isValidating}
                  onChange={(e) => {
                    setFieldValue("address_corpus", e.target.value.toUpperCase());
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextInput name="address_room" label="Квартира" type="number" disabled={isValidating} />
              </Grid>
            </Grid>

            <FamilyFormSubtitle>Довідка ВПО</FamilyFormSubtitle>

            <Grid container columnSpacing={2} columns={12}>

              <Grid item xs={12} sm={7}>
                <MaskedTextField
                  name="vpo_number"
                  label="Номер довідки ВПО"
                  format="####-##########"
                  // valueIsNumericString={true}
                  formatResult={true}
                  mask="_"
                  type="tel"
                  InputProps={{
                    endAdornment: <InputAdornment position="start" disablePointerEvents={true}>
                      {isValidating && (<CircularProgress size="1rem" />)}

                    </InputAdornment>,
                  }}
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <MaskedTextField
                  name="vpo_date"
                  label="Дата видачі довідки"
                  format="##.##.####"
                  mask="_"
                  type="tel"
                  // valueIsNumericString={true}
                  formatResult={true}
                  fullWidth
                  disabled={isValidating}
                />
              </Grid>

            </Grid>

            <FamilyFormSubtitle>Фактична адреса проживання ВПО</FamilyFormSubtitle>
            <Grid container columnSpacing={2} columns={12}>

              <Grid item xs={12} sm={5}>
                <AutocompleteField
                  name="vpo_city"
                  label="Населений пункт"
                  options={vpo_cities}
                  fullWidth
                  disabled={isValidating}
                  freeSolo
                />
              </Grid>

              <Grid item xs={12} sm={7} sx={{ textAlign: 'left' }}>
                <AutocompleteField name="vpo_street" label="Вулиця" options={vpo_streets} disabled={isValidating} freeSolo />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextInput
                  name="vpo_bud"
                  label="Номер будинку"
                  disabled={isValidating}
                  onChange={(e) => {
                    setFieldValue("vpo_bud", e.target.value.toUpperCase());
                  }}
                />
              </Grid>
              {/* <Grid item xs={12} sm={4}>
                <TextInput name="vpo_corp" label="Корпус" disabled={isValidating} />
              </Grid> */}
              <Grid item xs={12} sm={4}>
                <TextInput name="vpo_apartment" label="Квартира" type="number" disabled={isValidating} />
              </Grid>
              {/* 
              <Grid item xs={12} sm={9} md={10}>
                <TextInput
                  name="vpo_address"
                  label="Фактичне місце проживання згідно довідки ВПО"
                  helperText="наприклад, м.Запоріжжя, вул.Перемоги, 1"
                  fullWidth
                  disabled={isValidating}
                />
              </Grid> */}

              <Grid item xs={12} sm={3}>
                <CheckField name="in_hostel" label="МТП" disabled={isValidating}></CheckField>
              </Grid>


            </Grid>

            <FamilyFormSubtitle>Додаткова інформація</FamilyFormSubtitle>

            <Grid item xs={6}>
              <SelectInput
                name="disability_group"
                label="Група інвалідності"
                options={disabilityOptions}
                defaultValue=""
                disabled={isValidating}
                withNone={true}
              />
            </Grid>

            <Grid item xs={6}>
              <CheckField name="is_war_disability" label="Інвалідність внаслідок війни" disabled={isValidating || !values.disability_group}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CheckField name="has_disease" label="Хронічні захворювання" disabled={isValidating}></CheckField>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Grid item xs={12} sm={6}>
              <CheckField name="is_veteran" label="Учасник бойових дій" disabled={isValidating}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CheckField name="is_soldier_family" label="Член родини військовослужбовця" disabled={isValidating}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CheckField name="fallen_hero_family" label="Член родини загиблого військовослужбовця" disabled={isValidating}></CheckField>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* <Grid item xs={12}>
              <CheckField name="has_qr" label="Наявність QR-коду" disabled={isValidating}></CheckField>
            </Grid> */}

            <Grid item xs={12}>
              <CheckField name="is_pensioner" label="Пенсіонер, якому ще не виповнилось 60 років" disabled={isValidating}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CheckField name="is_poor" label="Малозабезпечена родина" disabled={isValidating}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <CheckField name="is_single" label="Одинока мати (батько)" disabled={isValidating}></CheckField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextInput
                name="notes"
                label="Примітки"
                helperText="Інші ВАЖЛИВІ дані, які можуть вплинути на результат отримання або не отримання допомоги"
                fullWidth
                disabled={isValidating}
              />
            </Grid>


            {checkingErrors && checkingErrors.map(error => (
              <ErrorMessage error={error} key={error} />
            ))}

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                sx={{ mr: 3 }}
                // onClick={handleSubmit}
                startIcon={isValidating ? <CircularProgress size="1rem" /> : null}
                disabled={isValidating}
              >
                {isValidating ? 'Валідація...' : 'Зберегти'}
              </Button>


            </Box>
            <ScrollToError />
          </Form>

        )}
      </Formik>
    </Box>
  )
}

export default RegisterForm
