<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { registry } from '@/core/services'
import { RpcService } from '@/core/services/rpc-service'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import type { FormInstance } from '@primevue/forms'

const router = useRouter()
const authStore = useAuthStore()

const databases = ref<string[]>([])
const loadingDatabases = ref(true)
const databaseError = ref<string | null>(null)
const formRef = ref<FormInstance | null>(null)

type LoginFormValues = {
    database?: string
    username?: string
    password?: string
}

const initialValues = ref<LoginFormValues>({
    database: '',
    username: '',
    password: '',
})

const resolver = zodResolver(
    z.object({
        database: z.string().min(1, 'Database is required'),
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
)

onMounted(async () => {
    try {
        await authStore.logout()
        const rpc = registry.get<RpcService>('rpcService')
        databases.value = await rpc.listDatabases()

        if (databases.value.length === 0) {
            databaseError.value = 'No databases available'
        } else if (databases.value.length === 1) {
            formRef.value?.setFieldValue('database', databases.value[0])
        }

    } catch (err: any) {
        databaseError.value = `Failed to load databases`
        console.log(err)
    } finally {
        loadingDatabases.value = false
    }
})


const onFormSubmit = async ({ valid, values }: any) => {
    if (valid) {
        authStore.clearError()
        const success = await authStore.login(values.database, values.username, values.password)
        if (success) await router.push('/nucleus')
    }
}
</script>

<template>
    <div class="grid grid-cols-12 min-h-screen">
        <div class="col-span-12 flex items-center justify-center">
            <Card class="w-full max-w-md border-none shadow-none">
                <template #header>
                    <div class="text-center pt-6">
                        <LogoIcon :width="128" :height="128" class="inline-block" />
                    </div>
                </template>
                <template #title>Sign In</template>
                <template #subtitle>Enter your credentials to access Nucleus</template>
                <template #content>
                    <Message
                        v-if="authStore.error"
                        severity="error"
                        closable
                        @close="authStore.clearError()"
                    >
                        {{ authStore.error }}
                    </Message>

                    <Message v-if="databaseError" severity="error" closable>
                        {{ databaseError }}
                    </Message>

                    <Form
                        ref="formRef"
                        :resolver="resolver"
                        :initialValues="initialValues"
                        @submit="onFormSubmit"
                        class="flex flex-col gap-4"
                        v-slot="$form"
                    >
                        <!-- Database Select -->
                        <FormField name="database">
                            <Select
                                :options="databases"
                                name="database"
                                placeholder="Select Database"
                                :loading="loadingDatabases"
                                :disabled="databases.length === 1"
                                fluid
                            />
                            <Message
                                v-if="$form?.database?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.database.error.message }}
                            </Message>
                        </FormField>

                        <!-- Username -->
                        <FormField name="username">
                            <InputText name="username" placeholder="Username" fluid />
                            <Message
                                v-if="$form?.username?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.username.error.message }}
                            </Message>
                        </FormField>

                        <!-- Password -->
                        <FormField name="password">
                            <Password
                                name="password"
                                placeholder="Password"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                                fluid
                            />
                            <Message
                                v-if="$form?.password?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.password.error.message }}
                            </Message>
                        </FormField>

                        <Button type="submit" label="Sign In" :loading="authStore.isLoading" />
                    </Form>
                </template>
            </Card>
        </div>
    </div>
</template>
