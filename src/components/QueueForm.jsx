import React, { useEffect, useState, useCallback } from 'react'
import { Typography, Grid } from '@mui/material'
import { Formik, Form } from 'formik'
import Swal from 'sweetalert2'
import TextInput from 'components/inputs/TextInput'
import MaskedTextField from 'components/inputs/MaskedTextField'
import CheckField from 'components/inputs/CheckField'
import SimpleSelect from 'components/inputs/SimpleSelect'
import SelectInput from 'components/inputs/SelectInput'
// import QueueInformer from './QueueInformer'
import Section from './layout/Section'
import { CircularProgress, Button } from '@mui/material'
import LinearProgressWithLabel from './LinearProgressWithLabel'
import { getFormData } from 'helpers/normalizeData'
import { dayNames } from 'helpers/date'
import getDay from 'date-fns/getDay'
import parse from 'date-fns/parse'
import addDays from 'date-fns/addDays'
import format from 'date-fns/format'
import { hubAction } from 'api'
import * as yup from 'yup'
import { parseDateString } from 'helpers/date'
import { cities_hromada } from 'helpers/toponyms'

//TEST
// import StormTest from './StormTest'

// async function stall(stallTime = 3000) {
//   await new Promise(resolve => setTimeout(resolve, stallTime));
// }

const initialValues = {
  last_name: '',
  first_name: '',
  middle_name: '',
  inn: '',
  tel: '',
  vpoNumber: '',
  vpoDate: '',
  city: '',
  agree: false,
  checked: false
}

const phoneNumberRegex =
  /\(?([0-9]{3})\)?([0-9]{3})[-. ]?([0-9]{2})[-. ]?([0-9]{2})$/

const today = new Date()
const minDate = new Date('2022-02-24')
const oneDayBeforeMinDate = addDays(minDate, -1)

const validationSchema = yup.object({
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
  tel: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(
      phoneNumberRegex,
      'Невірний формат номеру, (0ХХ)ХХХ-ХХ-ХХ'
    ),
  inn: yup
    .string()
    .required("Це поле обов'язкове")
    .length(10, 'Це поле має містити 10 цифр'),
  vpoNumber: yup
    .string()
    .required("Це поле обов'язкове")
    .matches(/^\d{4}[-]\d{10}$/, 'Невірний формат (1234-1234567890)'),
  vpoDate: yup
    .date()
    .required("Це поле обов'язкове")
    .transform(parseDateString)
    .typeError('Будь ласка, введіть дату в такому форматі ДД.ММ.РРРР')
    .min(oneDayBeforeMinDate, `Мінімальна дата ${format(minDate, 'dd.MM.yyyy')}`)
    .max(today, 'Дата з майбутнього? 🤔'),
  city: yup
    .string()
    .required("Це поле обов'язкове"),
  agree: yup
    .boolean()
    .oneOf([true], 'Щоб продовжити, необхідно надати згоду'),
})

const services = [
  {
    id: 1,
    name: 'Грошова допомога від ГО "Людина в біді"',
    title: `Електронна черга 
    на реєстрацію для отримання благодійної допомоги від чеської гуманітарної організації "Людина в біді"`,
    description: `❗ ВАЖЛИВО: Прийом на реєстрацію буде проводитись виключно за попереднім записом в електронній черзі.

      Один член сім'ї реєструє всіх інших членів родини.
      Для реєстрації потрібно надати інформацію з оригіналів документів, зокрема:
      ▪ паспорт кожного члена родини, свідоцтво про народження кожної дитини;
      ▪ реєстраційний номер облікової картки платника податків (ідентифікаційний код) кожної особи, яка реєструється;
      ▪ довідка ВПО кожного члена родини, який має статус ВПО (якщо є в наявності).

      Місце реєстрації: м. Запоріжжя Лермонтова, 9 (в будівлі БК "Орбіта" з протилежної сторони від головного входу). НЕ в Просторі Єдності!`,
    action: hubAction
  }
]
const QueueForm = () => {
  const [service, setService] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isClosed, setClosed] = useState(true)
  const [availableCount, setAvailableCount] = useState(100)

  const isFormVisible = service && !isLoading && !isClosed

  const getAvailableCount = (max, current) => {
    max = +max
    current = +current
    if (isNaN(max) || isNaN(current)) {
      return 0
    }
    return Math.ceil(100 - (current / max * 100))
  }

  const isFormClosed = useCallback(
    async (action) => {
      try {
        await fetch(action, { method: 'GET' })
          .then(res => res.json())
          .then(data => {
            // console.log(data)
            if (data?.status === 'open') {
              // console.log(data)
              setClosed(false)
              setAvailableCount(getAvailableCount(data?.max, data?.current))
            }
            return null
          })
      } catch (e) {
        throw new Error(e)
      } finally {
        setLoading(false)
      }
    }, []
  )

  useEffect(() => {
    if (service) {
      setClosed(isFormClosed(service?.action))
    }
  }, [service, isFormClosed])

  const handleSubmit = async (values, helpers) => {
    const toNormalize = ['first_name', 'last_name', 'middle_name']
    const toExclude = ['agree', 'checked']

    const data = getFormData(
      values,
      toNormalize,
      toExclude
    )

    try {
      if (!service?.action) return null
      await fetch(hubAction, {
        method: 'POST',
        body: data

      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data)

          switch (data?.result) {
            case 'closed':
            case 'refused':
              Swal.fire({
                title: 'Відхилено',
                text: `Форма закрита. Черга сформована або запис ще не розпочався.`,
                icon: 'error',
                confirmButtonText: 'Закрити',
                allowOutsideClick: false,
                allowEscapeKey: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  helpers?.resetForm()
                  window.location.reload()
                }
              })
              break
            case 'success':
              const { number, date, time } = data
              const day = dayNames[getDay(parse(date, 'dd.MM.yyyy', new Date()))]
              // const dateString = format(parseISO(data?.date), 'dd.MM.yyyy')
              // const time = format(parseISO(data?.time), 'hh:mm')
              Swal.fire({
                title: 'Ви записались в чергу',
                html:
                  `<div style='text-align: left'>
                  <table style='margin: 0 auto; border: 2px solid #a5dc86; padding: 0.5em; border-spacing: 10px;'>
                    <tbody>
                      <tr><td>Ваш №: </td>           <th> ${number}</strong></th></tr>
                      <tr><td>Дата: </td>            <th> ${date} (${day.toLowerCase()})</th></tr>
                      <tr><td>Час*: </td>            <th> ${time} </th></tr>
                    </tbody>
                  </table>
    
                  <br><br>
                  <b> Адреса реєстрації:</b> м. Запоріжжя, вул. Лермонтова, 9 (в будівлі БК "Орбіта" з протилежної сторони від головного входу). НЕ в Просторі Єдності!<br><br>
                  Номер в черзі дійсний тільки в цей день. <br><br>
                  * - час орієнтовний, але не запізнюйтесь
                  </div>
                  `,
                icon: 'success',
                allowOutsideClick: false,
                showConfirmButton: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                confirmButtonText: 'Закрити'
              })
              helpers?.resetForm()
              break
            case 'timeout':
              Swal.fire('', 'Перевищено час очікування. Спробуйте ще.', 'warning')
              break
            case 'error':
              console.log('error', data.error)
              Swal.fire({
                title: 'Помилка',
                text: `Спробуйте пізніше.`,
                icon: 'error',
                confirmButtonText: 'Закрити'
              })
              break
            default:
              console.log('Uknown answer from the server')
          }
        })
    } catch (error) {
      throw new Error(error)
    } finally {
      helpers?.setSubmitting(false)
    }
  }

  return (
    <Section sx={{ textAlign: 'center' }}>

      {!service && (
        <Section style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography color="inherit" variant="h5" component="div" sx={{ mb: 4 }}>
            Електронна черга
          </Typography>

          <SimpleSelect
            name="services"
            label="Оберіть послугу"
            options={services}
            defaultValue=""
            setOption={setService}
            current={service?.name}
            fullWidth
          />
        </Section>
      )}


      {/* <StormTest count={10} /> */}

      {service && isLoading && (
        <>
          <div> Завантаження...</div>
          <br />
          <div><CircularProgress size="3rem" /></div>
        </>
      )}

      {isClosed && !isLoading && ('Форма закрита. Черга сформована або запис ще не розпочався.')}


      {isFormVisible && (
        <>

          <Typography color="inherit" variant="h6" component="div" sx={{ mb: 4 }}>
            {service?.title.split('\n').map((line, k) => (
              <div key={k}>{line} <br /></div>
            ))}
          </Typography>

          {/* <Typography color="inherit" variant="p" component="div" sx={{ mb: 4, textAlign: 'left' }}>
            {service?.description.split('\n').map((line, k) => (
              <div key={k}>{line} <br /></div>
            ))}
          </Typography> */}
          <LinearProgressWithLabel variant="determinate" value={availableCount} />
          <Formik
            initialValues={initialValues}
            // validateOnChange={false}
            // validateOnBlur={false}
            validationSchema={validationSchema}
            onSubmit={(values, actions) => {
              handleSubmit(values, actions)
            }}
          >
            {({ values, isSubmitting, handleSubmit }) => (

              <Form onSubmit={handleSubmit}>

                {isSubmitting ? (
                  <>
                    <div>Шукаємо вільне місце. Не закривайте це вікно.</div> <br />
                    <CircularProgress size="3rem" />
                  </>
                ) : (
                  <>
                    <TextInput name="last_name" label="Прізвище" fullWidth />
                    <TextInput name="first_name" label="Ім'я" fullWidth />
                    <TextInput name="middle_name" label="По-батькові" fullWidth />

                    <Grid container columnSpacing={2} columns={12}>
                      <Grid item xs={12} sm={6}>
                        <MaskedTextField
                          name="tel"
                          label="Номер телефону"
                          type="tel"
                          format="+38(###)###-##-##"
                          // valueIsNumericString={true}
                          mask="_"
                          formatResult={true}
                          fullWidth
                          disabled={values?.checked}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <MaskedTextField
                          name="inn"
                          label="Податковий номер (РНОКПП)"
                          format="##########"
                          type="tel"
                          mask="_"
                          valueIsNumericString={true}
                          fullWidth
                          disabled={values?.checked}
                        />
                      </Grid>
                    </Grid>

                    <Grid container columnSpacing={2} columns={12}>
                      <Grid item xs={12} sm={7}>
                        <MaskedTextField
                          name="vpoNumber"
                          label="Номер довідки ВПО"
                          format="####-##########"
                          // valueIsNumericString={true}
                          formatResult={true}
                          mask="_"
                          type="tel"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <MaskedTextField
                          name="vpoDate"
                          label="Дата видачі довідки"
                          format="##.##.####"
                          mask="_"
                          type="tel"
                          // valueIsNumericString={true}
                          formatResult={true}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <SelectInput
                      name="city"
                      label="Звідки виїхали"
                      options={cities_hromada}
                    />

                    <CheckField
                      name="agree"
                      label="Даю згоду на обробку персональних даних"
                      sx={{ mb: 2, textAlign: 'left' }}
                    />

                    <Button
                      startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                      disabled={isSubmitting}
                      variant="contained"
                      color="primary"
                      size="large"
                      type="submit"
                    >
                      {isSubmitting ? 'Завантаження' : 'Відправити'}
                    </Button>
                  </>
                )}

              </Form>
            )}

          </Formik>

        </>
      )}
      {/* <QueueInformer /> */}
    </Section>
  )
}

export default QueueForm