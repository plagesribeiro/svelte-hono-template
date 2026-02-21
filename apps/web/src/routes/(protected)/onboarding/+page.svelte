<script lang="ts">
import { CreateOrganization } from 'svelte-clerk'
import { client } from '$lib/api.svelte'
import { addToast } from '$lib/stores/toast.svelte'

let { data } = $props()

const needsOrgCreation = $derived(!data.hasOrg)

let currentStep = $state(0)
let businessType = $state<'barbershop' | 'court'>('barbershop')
let name = $state('')
let slug = $state('')
let chatWelcomeMessage = $state('')
let saving = $state(false)

const DAY_NAMES = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

let businessHours = $state(
	Array.from({ length: 7 }, (_, i) => ({
		dayOfWeek: i,
		openTime: '08:00',
		closeTime: '18:00',
		isOpen: i >= 1 && i <= 5,
	}))
)

const generateSlug = (val: string) =>
	val
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

const handleNameChange = () => {
	slug = generateSlug(name)
}

const totalSteps = 5
const STEP_LABELS = [
	'Tipo de Negocio',
	'Informacoes Basicas',
	'Horario de Funcionamento',
	'Boas-vindas',
	'Revisar e Concluir',
]

const canNext = $derived.by(() => {
	if (currentStep === 0) return true
	if (currentStep === 1) return name.trim().length > 0 && slug.trim().length > 0
	return true
})

const next = () => {
	if (currentStep < totalSteps - 1) currentStep++
}
const prev = () => {
	if (currentStep > 0) currentStep--
}

const submit = async () => {
	saving = true
	try {
		const res = await client.admin.organization.onboarding.$put({
			json: {
				businessType,
				slug,
				name,
				businessHours,
				chatWelcomeMessage: chatWelcomeMessage || undefined,
			},
		})
		if (res.ok) {
			addToast('Onboarding concluido com sucesso!', 'success')
			window.location.href = '/dashboard'
		} else {
			addToast('Erro ao concluir onboarding', 'error')
		}
	} catch {
		addToast('Erro ao concluir onboarding', 'error')
	} finally {
		saving = false
	}
}
</script>

{#if needsOrgCreation}
  <div class="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold">Crie sua organizacao</h1>
      <p class="text-base-content/60 mt-2">Antes de comecar, crie uma organizacao para gerenciar seu negocio</p>
    </div>
    <CreateOrganization afterCreateOrganizationUrl="/onboarding" skipInvitationScreen={true} />
  </div>
{:else}
<div class="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
  <div class="w-full max-w-2xl">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold">Configurar sua conta</h1>
      <p class="text-base-content/60 mt-2">Vamos configurar tudo para voce comecar</p>
    </div>

    <!-- Steps indicator -->
    <ul class="steps steps-horizontal w-full mb-8">
      {#each STEP_LABELS as label, i}
        <li class="step {i <= currentStep ? 'step-primary' : ''}">{label}</li>
      {/each}
    </ul>

    <!-- Step content -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Step 0: Tipo de Negocio -->
        {#if currentStep === 0}
          <h2 class="card-title text-xl mb-4">Qual o tipo do seu negocio?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              class="card bg-base-200 cursor-pointer hover:shadow-lg transition-shadow border-2 {businessType === 'barbershop' ? 'border-primary' : 'border-transparent'}"
              onclick={() => (businessType = 'barbershop')}
            >
              <div class="card-body items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="font-bold text-lg">Barbearia</h3>
                <p class="text-sm text-base-content/60">Agendamento com profissionais</p>
              </div>
            </button>

            <button
              type="button"
              class="card bg-base-200 cursor-pointer hover:shadow-lg transition-shadow border-2 {businessType === 'court' ? 'border-primary' : 'border-transparent'}"
              onclick={() => (businessType = 'court')}
            >
              <div class="card-body items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="font-bold text-lg">Quadras Esportivas</h3>
                <p class="text-sm text-base-content/60">Reserva de quadras e espacos</p>
              </div>
            </button>
          </div>

        <!-- Step 1: Informacoes Basicas -->
        {:else if currentStep === 1}
          <h2 class="card-title text-xl mb-4">Informacoes basicas</h2>
          <div class="space-y-4">
            <div class="form-control">
              <label class="label" for="org-name">
                <span class="label-text">Nome do estabelecimento</span>
              </label>
              <input
                id="org-name"
                type="text"
                placeholder="Ex: Barbearia do Joao"
                class="input input-bordered w-full"
                bind:value={name}
                oninput={handleNameChange}
              />
            </div>
            <div class="form-control">
              <label class="label" for="org-slug">
                <span class="label-text">Slug (URL amigavel)</span>
              </label>
              <input
                id="org-slug"
                type="text"
                placeholder="barbearia-do-joao"
                class="input input-bordered w-full"
                bind:value={slug}
              />
              <label class="label">
                <span class="label-text-alt text-base-content/50">Sera usado na URL do seu agendamento</span>
              </label>
            </div>
          </div>

        <!-- Step 2: Horario de Funcionamento -->
        {:else if currentStep === 2}
          <h2 class="card-title text-xl mb-4">Horario de funcionamento</h2>
          <div class="space-y-3">
            {#each businessHours as hour, i}
              <div class="flex items-center gap-3 flex-wrap">
                <label class="flex items-center gap-2 w-28">
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-sm"
                    bind:checked={hour.isOpen}
                  />
                  <span class="text-sm font-medium">{DAY_NAMES[i]}</span>
                </label>
                {#if hour.isOpen}
                  <div class="flex items-center gap-2">
                    <input
                      type="time"
                      class="input input-bordered input-sm w-32"
                      bind:value={hour.openTime}
                    />
                    <span class="text-base-content/50">ate</span>
                    <input
                      type="time"
                      class="input input-bordered input-sm w-32"
                      bind:value={hour.closeTime}
                    />
                  </div>
                {:else}
                  <span class="text-sm text-base-content/40">Fechado</span>
                {/if}
              </div>
            {/each}
          </div>

        <!-- Step 3: Mensagem de Boas-vindas -->
        {:else if currentStep === 3}
          <h2 class="card-title text-xl mb-4">Mensagem de boas-vindas</h2>
          <p class="text-sm text-base-content/60 mb-4">
            Essa mensagem sera exibida para os clientes no inicio do chat de agendamento.
          </p>
          <div class="form-control">
            <textarea
              class="textarea textarea-bordered w-full h-32"
              placeholder="Ola! Bem-vindo ao nosso sistema de agendamento. Como posso ajudar?"
              bind:value={chatWelcomeMessage}
            ></textarea>
          </div>

        <!-- Step 4: Revisar e Concluir -->
        {:else if currentStep === 4}
          <h2 class="card-title text-xl mb-4">Revisar e concluir</h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-sm text-base-content/60 uppercase">Tipo de Negocio</h3>
              <p class="mt-1">{businessType === 'barbershop' ? 'Barbearia' : 'Quadras Esportivas'}</p>
            </div>

            <div class="divider my-1"></div>

            <div>
              <h3 class="font-semibold text-sm text-base-content/60 uppercase">Nome</h3>
              <p class="mt-1">{name}</p>
            </div>

            <div>
              <h3 class="font-semibold text-sm text-base-content/60 uppercase">Slug</h3>
              <p class="mt-1 font-mono text-sm">{slug}</p>
            </div>

            <div class="divider my-1"></div>

            <div>
              <h3 class="font-semibold text-sm text-base-content/60 uppercase">Horario de Funcionamento</h3>
              <div class="mt-1 space-y-1">
                {#each businessHours as hour, i}
                  <div class="flex gap-2 text-sm">
                    <span class="w-20 font-medium">{DAY_NAMES[i]}:</span>
                    {#if hour.isOpen}
                      <span>{hour.openTime} - {hour.closeTime}</span>
                    {:else}
                      <span class="text-base-content/40">Fechado</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>

            {#if chatWelcomeMessage}
              <div class="divider my-1"></div>
              <div>
                <h3 class="font-semibold text-sm text-base-content/60 uppercase">Mensagem de Boas-vindas</h3>
                <p class="mt-1 text-sm whitespace-pre-wrap">{chatWelcomeMessage}</p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Navigation -->
        <div class="card-actions justify-between mt-6">
          <button
            type="button"
            class="btn btn-outline"
            disabled={currentStep === 0}
            onclick={prev}
          >
            Voltar
          </button>

          {#if currentStep < totalSteps - 1}
            <button
              type="button"
              class="btn btn-primary"
              disabled={!canNext}
              onclick={next}
            >
              Proximo
            </button>
          {:else}
            <button
              type="button"
              class="btn btn-primary"
              disabled={saving}
              onclick={submit}
            >
              {#if saving}
                <span class="loading loading-spinner loading-sm"></span>
              {/if}
              Concluir
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
{/if}
