
import React, { useEffect, useState } from 'react'
import { action } from 'api'
import { normalizePersonData } from 'helpers/normalizeData'
import Section from 'components/layout/Section'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FamilyForm from 'components/family/FamilyForm'
import CircularProgress from '@mui/material/CircularProgress'
import FamilyTable from 'components/family/FamilyTable'
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FamilySearch from './FamilySearch'
import ErrorMessage from './ErrorMessage'
import { useNavigate } from "react-router-dom";


const FamilyCreate = ({ hasNumber }) => {

  const [familyNumber, setFamilyNumber] = useState(null)
  const [searchResult, setSearchResult] = useState(null)
  const [error, setError] = useState(null)

  const [family, setFamily] = useState([])
  const [isLoading, setLoading] = useState(false)

  const navigate = useNavigate()

  const FormSwal = withReactContent(Swal)

  const isFamilyEmpty = family.length === 0
  // eslint-disable-next-line
  const checkIsUnique = (name, value) => {
    if (family.length === 0) return true
    const targetsArray = family.map(item => item[name])
    return targetsArray.indexOf(value) === -1
  }

  const addPerson = (personData) => {
    const errors = []
    if (personData.tax_number && !checkIsUnique('tax_number', personData.tax_number)) {
      errors.push('Не можна додати дві особи з однаковими ІПН')
    }

    if (personData.document && !checkIsUnique('document', personData.document)) {
      errors.push('Не можна додати дві особи з однаковими посвідченнями особи')
    }

    if (personData.vpo_number && !checkIsUnique('vpo_number', personData.vpo_number)) {
      errors.push('Не можна додати дві особи з однаковими довідками ВПО')
    }
    if (errors.length) return errors

    let id = 1
    if (family.length > 0) {
      const last = [...family].sort((a, b) => b.id - a.id)[0]
      id = last.id + 1
    }
    const newFamily = [...family, { ...personData, id }]
    sessionStorage.setItem("autosave", JSON.stringify(newFamily))
    setFamily(newFamily)
    return null
  }

  const handleAddPerson = () => {
    FormSwal.fire({
      html: <FamilyForm isHouseholder={isFamilyEmpty} personValues={null} submitAction={addPerson} closeAction={FormSwal.close} family={family} />,
      width: '650px',
      showConfirmButton: false,
      showCloseButton: true,
      allowEscapeKey: false,
      allowEnterKey: false,
      allowOutsideClick: false,
    })
  }

  const handleChangePerson = (person) => {
    setFamily((currentFamily) => {
      const newFamily = currentFamily.map(item => {
        return item.id === person.id ? { ...person } : item
      })
      sessionStorage.setItem("autosave", JSON.stringify(newFamily))
      return newFamily
    })
  }

  const deletePerson = (person) => {
    setFamily((currentFamily) => {
      const newFamily = currentFamily.filter(currentItem => currentItem.id !== person.id
      )
      sessionStorage.setItem("autosave", JSON.stringify(newFamily))
      return newFamily
    })
  }

  const handleFamilyCreate = async (values, helpers) => {
    if (family.length) {

      Swal.fire({
        title: 'Ви впевнені?',
        text: "Переконайтесь, що ви додали всіх членів родини.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Так, відправити дані',
        cancelButtonText: 'Ні'
      }).then((result) => {
        if (result.isConfirmed) {
          sendFamilyData(family)
        }
      })
    }
  }

  function sendFamilyData(familyData) {
    setLoading(true)
    const toNormalize = ['first_name', 'last_name', 'middle_name', 'street']

    const normalizedData = familyData.map(person => {
      const { id, isHouseholder, ...rest } = person
      return normalizePersonData(rest, toNormalize)
    })

    fetch(action, {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(normalizedData)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === 'success') {
          Swal.fire({
            title: 'Успіх!',
            html: `Сім'ю зареєстровано успішно. Номер сім'ї: <br>
            <strong style="font-size: 1.5em;">${data.number}</strong>`,
            icon: 'success',
            showCloseButton: true,
            confirmButtonText: 'Закрити',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
          })
          setFamily([])
          sessionStorage.removeItem("autosave")
          navigate('/orikhiv-aid/new', { replace: true })
        }
        if (data.result === 'refused') {
          // console.log(1)
          Swal.fire('Відмова', data?.message, 'error')
        }
        if (data.result === 'timeout') {
          Swal.fire('', 'Перевищено час очікування. Спробуйте ще.', 'warning')
        }
        if (data.result === 'error') {
          // console.log(JSON.stringify(data, null, 2))
          Swal.fire({
            title: 'Помилка',
            text: `Щось пішло не так. Спробуйте пізніше.
                Текст помилки: ${data.message}.`,
            icon: 'error',
            confirmButtonText: 'Закрити'
          })
        }
      }).catch(e => { throw new Error(e) }).finally(() => { setLoading(false) })
  }

  useEffect(() => {
    if (sessionStorage.getItem('autosave')) {
      setFamily(JSON.parse(sessionStorage.getItem("autosave")))
    }
  }, [])

  if (isLoading) {
    return (
      <Section style={{ textAlign: 'center' }}>
        <Typography sx={{ mb: 2 }}>Триває завантаження... Не закривайте це вікно...</Typography>
        <CircularProgress />
      </Section>
    )
  }

  const handleChangeFamilyNumber = (result) => {
    setFamilyNumber(result.value)
    if (result.success) {
      setError('Ця сім\'я вже уточнена. Скористайтесь внесенням змін.')
    }
  }

  const canContinue = (familyNumber || !hasNumber) && !error
  // console.log({ familyNumber, hasNumber, canContinue, error })
  return (
    <Section style={{ marginBottom: '2em', textAlign: 'center' }} maxWidth={"md"}>
      {/* <CheckUser /> */}
      <Typography variant="h5" sx={{ mb: 2 }}>{familyNumber ? `Уточнення даних сім'ї №${familyNumber}` : 'Реєстрація нового домогосподарства'}</Typography>

      {!familyNumber && hasNumber && (
        <FamilySearch handleChangeFamilyNumber={handleChangeFamilyNumber} />
      )}

      {error && <ErrorMessage error={error} />}

      {canContinue && isFamilyEmpty && (
        <Box>
          <Typography sx={{ mb: 2 }}>Почніть з введення даних голови домогосподарства</Typography>
          <Button variant="contained" onClick={handleAddPerson}>
            Почати
          </Button>
        </Box>
      )}

      {canContinue && !isFamilyEmpty && (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Всього осіб: {family.length} <Button variant="outlined" color="primary" onClick={handleAddPerson} startIcon={<PersonAddIcon />}>Додати</Button>
            </Box>
            <FamilyTable personsArray={family} changePerson={handleChangePerson} deletePerson={deletePerson} />
          </Box>

          <Box sx={{ mt: 2, mb: 8 }}>
            <Button variant="contained" onClick={handleFamilyCreate} startIcon={<SendIcon />} sx={{ ml: 2 }}>Відправити дані</Button>
          </Box>
        </>
      )}

    </Section>
  )
}

export default FamilyCreate