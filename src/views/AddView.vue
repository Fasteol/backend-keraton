<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import InputFoto from '@/components/InputFoto.vue'
import CategoryDropdown from '@/components/CategoryDropdown.vue'
import AlertCard from '@/components/AlertCard.vue'
import DashboardHelper from '@/utilities/DashboardHelper'

const { selectedItemToEdit, getImageURL } = DashboardHelper

const router = useRouter()
const route = useRoute()

const editId = ref('')
const title = ref('')
const desc = ref('')
const category = ref('') 
const price = ref('')
const imageName = ref('')
const selectedImageURL = ref('') // State to hold the selected image URL
const selectedImage = ref(null) // State to hold the selected image File
const defaultImageURL = ref(
  'https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png'
)
const submitAlert = ref(false)
const confirmAlert = ref(false)

const showAlert = ref(false)
const alertType = ref('')
const alertTitle = ref('')
const alertMessage = ref('')

const insertDatabase = async () => {
  try {
    const formData = new FormData()
    formData.append('image', selectedImage.value)
    formData.append('title', title.value)
    formData.append('desc', desc.value)
    formData.append('category', category.value.toUpperCase())
    formData.append('price', parseFloat(price.value))

    const response = await fetch('http://localhost:3000/add/order-details', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Gagal membuat pesanan. Silahkan coba lagi.')
    } else {
      submitAlert.value = !submitAlert.value
      setTimeout(() => {
        router.push('/')
      }, 1200)
    }
  } catch (error) {
    console.log(error)
  }
}

const updateDatabase = async () => {
  try {
    const formData = new FormData()
    formData.append('image', selectedImage.value)
    formData.append('imgName', imageName.value)
    formData.append('title', title.value)
    formData.append('desc', desc.value)
    formData.append('category', category.value.toUpperCase())
    formData.append('price', parseFloat(price.value))

    const response = await fetch(`http://localhost:3000/edit/order-details/${encodeURIComponent(editId.value)}`, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Gagal mengubah pesanan. Silahkan coba lagi.')
    } else {
      submitAlert.value = !submitAlert.value
      setTimeout(() => {
        router.push('/')
      }, 1200)
    }
  } catch (error) {
    console.log(error)
  }
}

const capitalizeFirstLetter = (str) => {
  const lowercaseStr = str.toLowerCase()
  return lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1)
}

const submit = () => {
  confirmAlert.value = false
  insertDatabase()
}
// Method to handle the selected file from InputFoto component
const handleFileSelected = (file) => {
  // Convert the selected file to URL
  const imageURL = URL.createObjectURL(file)
  // Update the state with the selected image URL
  selectedImage.value = file
  selectedImageURL.value = imageURL
}

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price.value)
})

const updateCategory = (selectedCategory) => {
  category.value = selectedCategory
}

const getEmptyFields = () => {
  const emptyFields = []
  if (!title.value.trim()) {
    emptyFields.push('Judul')
  }
  if (!desc.value.trim()) {
    emptyFields.push('Desc')
  }
  if (!category.value.trim()) {
    emptyFields.push('Kategori')
  }
  if (!String(price.value).trim()) {
    emptyFields.push('Harga')
  }
  return emptyFields
}

const confirmAdd = () => {
  const emptyFields = getEmptyFields()

  if (emptyFields.length > 0) {
    showAlert.value = true
    alertTitle.value = 'Error'
    alertType.value = 'danger' // Set your alert type
    message.value = `Isi kolom ${emptyFields.join(', ')} terlebih dahulu.` // Set your alert message
    return // Prevent confirmation if there are empty fields
  }

  confirmAlert.value = true
}

const currentPath = ref(route.path)
const isEditPage = () => {
  editId.value = selectedItemToEdit.value.id
  if (currentPath.value === `/edit/${encodeURIComponent(editId.value)}`) {
    title.value = selectedItemToEdit.value.name
    desc.value = selectedItemToEdit.value.desc
    price.value = selectedItemToEdit.value.price
    category.value = capitalizeFirstLetter(selectedItemToEdit.value.category)
    imageName.value = selectedItemToEdit.value.image
    selectedImageURL.value = getImageURL(selectedItemToEdit.value.image)
  }
}

watchEffect(() => {
  currentPath.value = route.path
})

onMounted(() => {
  isEditPage()
})
</script>

<template>
  <AlertCard :showAlert="showAlert" :alertTitle="alertTitle" :alertType="alertType" :alertMessage="alertMessage"
    @hideAlert="showAlert = false" />
  <div class="add__alert-confirmation_overlay" v-if="confirmAlert">
    <div class="add__alert-confirmation">
      <h2>Kamu yakin mau menambahkan {{ title ? title : 'Tiket' }}?</h2>
      <div class="button-group">
        <button @click="confirmAlert = false">Cancel</button>
        <button @click="submit()">Yes</button>
      </div>
    </div>
  </div>
  <div class="bubble-alert_submit" v-if="submitAlert">
    <p v-if="!currentPath === `/edit/${encodeURIComponent(editId)}`">Data berhasil ditambahkan</p>
    <p v-else>Data berhasil diubah</p>
  </div>

  <main class="add">
    <section class="add__input">
      <InputFoto @file-selected="handleFileSelected" :selectedImageURL="selectedImageURL" />
      <div class="add__input-card_title">
        <h6>Judul</h6>
        <div class="input_wrapper">
          <input class="title-input" type="text" rows="1" v-model="title" />
        </div>
      </div>
      <div class="add__input-card_title">
        <h6>Deskripsi</h6>
        <div class="input_wrapper">
          <textarea class="desc-input" rows="1" v-model="desc"></textarea>
        </div>
      </div>
      <div class="add__input-category">
        <h6>Kategori</h6>
        <CategoryDropdown @option-selected="updateCategory" :initial-category="category"/>
      </div>
      <div class="add__input-price">
        <h6>Harga</h6>
        <div class="input-price">
          <p>Rp.</p>
          <input type="number" name="" id="" v-model="price" />
        </div>
      </div>
    </section>

    <section class="add__preview w-full">
      <h5>Preview</h5>
      <div class="add__preview-card_container">
        <h6 class="add__preview-category">{{ category ? category : 'Category' }}</h6>
        <div class="add__preview-image_container">
          <img :src="selectedImageURL ? selectedImageURL : defaultImageURL" alt="" />
        </div>
        <div class="add__preview-card_details sm-top-1">
          <h5 class="fw-600">{{ title ? title : 'Card Title' }}</h5>
          <p>{{ desc ? desc : 'Card Description' }}</p>
          <div class="add__preview-card-details-price">
            <h5 class="fw-600 sm-top-1">
              <span class="fw-600">{{ formattedPrice }}</span>
            </h5>
          </div>
        </div>
      </div>
      <div class="add__preview-cta_container">
        <button v-if="!currentPath === `/edit/${encodeURIComponent(editId)}`" class="add__preview_button" type="submit" @click="confirmAdd()">Tambahkan</button>
        <button v-else class="add__preview_button" type="submit" @click="updateDatabase()">Edit</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.add {
  display: flex;
  width: 100%;
  gap: 10rem;
}

/* input container */
.add__input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* input | title textarea */
.title-input,
/* input | desc textarea */
.desc-input {
  min-width: 320px;
  width: 100%;
  resize: none;
  /* Disable textarea resizing */
  border: none;
  padding: 0.5rem;
  box-sizing: border-box;
  font-size: inherit;
  font-family: inherit;
  border: 1px solid black;
  line-height: inherit;
  border-radius: 0.5rem;
}

.desc-input {
  height: 118px;
}

/* input harga */
input[type='number'] {
  width: 20rem;
  height: 2rem;
  border-radius: 0.5rem;
  appearance: none;
  -webkit-appearance: none;
  /* Remove default appearance for webkit browsers */
  -moz-appearance: textfield;
  /* Show default appearance for Firefox */
  background-color: transparent;
  padding-left: 35px;
  color: rgb(0, 0, 0);
  position: relative;
  border: 1px solid #000;
}

/* Remove spinner buttons for webkit browsers */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  display: none;
}

input:focus,
button:focus,
textarea:focus {
  border-color: var(--color-primary);
  /* Change the border color to green */
  outline: none;
  /* Remove the default focus outline */
  box-shadow: 0 0 0 2px var(--color-primary);
  /* Add a green box-shadow to indicate focus */
}

.input-price {
  position: relative;
}

.input-price p {
  position: absolute;
  top: 4px;
  left: 10px;
}

/* preview */
.add__preview {
  display: flex;
  flex-direction: column;
}

/* preview | card container */
.add__preview-card_container {
  margin-top: 1rem;
  width: calc(100% - 8rem);
  min-width: 449px;
  height: 30rem;
  background-color: #ffffff;
  border-radius: 0.8rem;
  box-shadow: 0px 0px 10px 2px rgb(0, 0, 0, 0.2);
  padding: 1rem;
  overflow-y: auto;
}

/* preview | card category */

.add__preview-category {
  background-color: #d5d5d5;
  border-radius: 0.3rem;
  width: fit-content;
  padding: 0 1rem;
  font-size: 13px;
  margin-bottom: 0.5rem;
}

/* preview | card image container */
.add__preview-image_container {
  background-color: #d9d9d9;
  width: 100%;
  height: 206px;
  border-radius: 0.6rem;
}

.add__preview-image_container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

/* preview | card details container */
.add__preview-card-details {
  margin-top: 1rem;
}

.add__preview-card-details-price {
  font-size: 24px;
}

/* form tambahkan button */
.add__preview-cta_container {
  margin-top: 2rem;
  width: calc(100% - 8rem);
  min-width: 449px;
  display: flex;
  align-items: center;
}

.add__preview_button {
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 0;
  font-size: 18px;
  line-height: 28px;
  background-color: #d9d9d9;
}

.add__preview button {
  cursor: pointer;
}

/* add | alert */
.add__alert-confirmation_overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background-color: rgb(0, 0, 0, 0.2);
  z-index: 999;
}

.add__alert-confirmation {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translate(-50%);
  background-color: #ffffff;
  border: 1px solid rgba(255, 226, 154, 0.9);
  padding: 1rem;
  border-radius: 0.5rem;
}

.add__alert-confirmation .button-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: end;
  margin-top: 1rem;
}

.add__alert-confirmation .button-group button {
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--color-primary);
  filter: saturate(10);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.add__alert-confirmation .button-group button:first-child {
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #8f8f8f;
  color: #ffffff;
}

/* bubble alert */
.bubble-alert_submit {
  position: fixed;
  top: 1rem;
  right: 1%;
  background-color: #d9d9d9;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

@media screen and (max-width: 1200px) {
  .add {
    gap: 4rem;
    padding-right: 1rem;
  }
}

@media screen and (max-width: 1000px) {
  .add {
    gap: 2rem;
  }
}

/* tablets */
@media screen and (max-width: 768px) {
  .add {
    flex-direction: column;
    /* Change to column layout */
    align-items: center;
    gap: 4rem;
  }

  .add__preview {
    margin-top: 1rem;
    width: 100%;
  }
}

/* For phones */
@media screen and (max-width: 480px) {
  .add__preview {
    margin-top: 1rem;
    /* Add space between sections */
    order: 1;
    /* Move below the input section */
  }

  .add__input {
    width: 100%;
    /* Take full width */
  }
}
</style>
