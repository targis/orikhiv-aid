import React from 'react'
import { Grid, Typography } from '@mui/material'
import { PatternFormat } from 'react-number-format'

const PersonDetails = ({ values }) => {

  const { last_name, first_name, middle_name, born, tax_number, document, tel, address_city, address_street, address_number, address_corpus, address_room, vpo_number, vpo_date, has_qr, disability_group, has_disease, is_soldier_family, is_poor, is_single, is_householder, is_pensioner, notes, need_call, is_war_disability, fallen_hero_family, is_veteran, in_hostel, vpo_city, vpo_street, vpo_bud, vpo_apartment } = values
  const getStreet = () => {
    if (address_city === 'Оріхів') {
      const normalizedStreet = address_street.split(', ').reverse().join(' ')
      return normalizedStreet
    }
    return address_street
  }

  const fullName = `${last_name} ${first_name} ${middle_name}`
  const fullAddress = `${address_city}, ${getStreet()}, буд. ${address_number}${address_corpus ? '-' + address_corpus : ''}${address_room ? ', кв. ' + address_room : ''}`
  const vpoDoc = `від ${vpo_date} № ${vpo_number}`
  const vpo_address = `${vpo_city}, ${vpo_street}, буд. ${vpo_bud}${vpo_apartment ? ', кв. ' + vpo_apartment : ''}`

  // const disability = has_disability ? `✅ Так (${disability_group})` : '❌ Ні'

  const summary = [
    {
      primary: 'Повне ім\'я',
      secondary: fullName
    },
    {
      primary: 'Дата народження',
      secondary: born,
      format: '##.##.####'
    },
    {
      primary: 'Номер телефону',
      secondary: `${tel}${need_call ? ' (потрібно дзвонити)' : ''}`,
      // format: '(###) ### ## ##'
    },
    {
      primary: 'Податковий номер',
      secondary: tax_number
    },
    {
      primary: 'Паспорт',
      secondary: document
    },
    {
      primary: 'Адреса реєстрації',
      secondary: fullAddress
    },
    {
      primary: 'Фактична адреса',
      secondary: vpo_address
    },
    {
      primary: 'Проживає в гуртожитку / МТП',
      secondary: in_hostel ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Довідка ВПО',
      secondary: vpoDoc
    },
    {
      primary: 'Група інвалідності',
      secondary: disability_group || 'відсутня'
    },
    {
      primary: 'Інвалідність внаслідок війни',
      secondary: is_war_disability ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Хронічні захворювання',
      secondary: has_disease ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Учасник бойових дій',
      secondary: is_veteran ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Член родини військовослужбовця',
      secondary: is_soldier_family ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Член родини загиблого військовослужбовця',
      secondary: fallen_hero_family ? '✅ Так' : '❌ Ні'
    },
    // {
    //   primary: 'Наявність QR-коду',
    //   secondary: has_qr ? '✅ Так' : '❌ Ні'
    // },
    {
      primary: 'Пенсіонер, якому ще не виповнилось 60 років',
      secondary: is_pensioner ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Малозабезпечена родина',
      secondary: is_poor ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Одинока мати (батько)',
      secondary: is_single ? '✅ Так' : '❌ Ні'
    },
    {
      primary: 'Примітки',
      secondary: notes
    },
  ]

  return (

    <div style={{ textAlign: 'left' }}>

      {summary && summary.map((item, i) => (
        <Grid key={item.primary} container sx={{ py: 1, borderBottom: i + 1 === summary.length ? 'none' : '1px solid #eee' }}>
          <Grid item xs={12} sm={4} sx={{ fontSize: '.75em' }}><b>{item.primary}: </b></Grid>
          <Grid item xs={12} sm={8}>{item.format ? <PatternFormat displayType='text' value={item.secondary} format={item.format} /> : item.secondary}</Grid>
        </Grid>
      ))}

    </div>

  )
}

export default PersonDetails