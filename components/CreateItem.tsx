import { useState, ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, gql } from '@apollo/client'
import { useRouter } from 'next/router'
// import { v2 as cloudinary } from 'cloudinary'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { ALL_ITEMS_QUERY } from './Items'
import { PAGINATION_QUERY } from './Pagination'
import { CreateItem as CreateItemTypes, CreateItemVariables } from './__generated__/CreateItem'

type Inputs = Record<string, string>

const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

function CreateItem() {
  const [image, setImage] = useState('')
  const [largeImage, setLargeImage] = useState('')
  const { register, handleSubmit, errors } = useForm<Inputs>()
  const router = useRouter()

  const [createItem, { loading, error }] = useMutation<CreateItemTypes, CreateItemVariables>(
    CREATE_ITEM_MUTATION,
    { refetchQueries: [{ query: ALL_ITEMS_QUERY }, { query: PAGINATION_QUERY }] }
  )

  async function uploadFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files as FileList
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'wanderlost')

    const res = await fetch('https://api.cloudinary.com/v1_1/davyhausser/image/upload', {
      method: 'POST',
      body: data,
    })
    const file = await res.json()

    setImage(file.secure_url)
    setLargeImage(file.eager[0].secure_url)
  }

  // async function uploadFile(e: ChangeEvent<HTMLInputElement>) {
  //   const files = e.target.files as FileList
  //   console.log(files)

  //   // File upload
  //   cloudinary.uploader.upload(files[0].name, { upload_preset: 'wanderlost' }, function (
  //     err,
  //     image
  //   ) {
  //     console.log(err, image)
  // console.log()
  // console.log('** File Upload')
  // if (err) {
  //   console.warn(err)
  // }
  // // if (!image) {
  // //   return null
  // // }
  // console.log("* public_id for the uploaded image is generated by Cloudinary's service.")
  // console.log('* ' + image.public_id)
  // console.log('* ' + image.url)

  // setImage(image.secure_url)
  // setLargeImage(image.eager[0].secure_url)
  //   })
  // }

  async function onSubmit(data: Inputs) {
    const res = await createItem({
      variables: {
        title: data.title,
        description: data.description,
        price: parseInt(data.price, 10),
        image: image,
        largeImage: largeImage,
      },
    })
    router.push('/item/[id]', `/item/${res.data?.createItem.id}`)
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Error error={error} />
      <fieldset disabled={loading} aria-busy={loading}>
        <label>Image</label>
        <input name="file" type="file" ref={register({ required: true })} onChange={uploadFile} />
        {image && <img src={image} width="200" alt="Upload Preview" />}

        <label>Title</label>
        <input name="title" ref={register({ required: true })} />
        {errors.title && <p>This is required</p>}

        <label>Price</label>
        <input name="price" type="number" ref={register({ required: true })} />
        {errors.price && <p>This is required</p>}

        <label>Description</label>
        <textarea name="description" ref={register({ required: true })} />
        {errors.description && <p>This is required</p>}

        <button type="submit">Submit</button>
      </fieldset>
    </Form>
  )
}

export default CreateItem
export { CREATE_ITEM_MUTATION }
