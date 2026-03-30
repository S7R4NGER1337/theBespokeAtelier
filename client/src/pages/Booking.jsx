import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, startOfDay } from 'date-fns';
import { fetchServices } from '../api/services';
import { fetchBarbers } from '../api/barbers';
import { fetchAvailableSlots, createAppointment } from '../api/appointments';
import { formatPrice } from '../utils/helpers';
import styles from './Booking.module.css';

const STEPS = ['Service', 'Barber', 'Date & Time', 'Confirm'];

const confirmSchema = yup.object({
  clientName: yup.string().trim().required('Name is required').max(100),
  clientPhone: yup
    .string()
    .trim()
    .required('Phone is required')
    .matches(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
});

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const { data: services = [], isError: servicesError } = useQuery({ queryKey: ['services'], queryFn: () => fetchServices() });
  const { data: barbers = [], isError: barbersError } = useQuery({ queryKey: ['barbers'], queryFn: fetchBarbers });

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const { data: slots = [] } = useQuery({
    queryKey: ['slots', selectedBarber?._id, dateStr],
    queryFn: () => fetchAvailableSlots(selectedBarber._id, dateStr),
    enabled: !!selectedBarber && !!dateStr,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(confirmSchema),
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => setConfirmed(true),
  });

  const totalPrice = selectedService && selectedBarber
    ? selectedService.pricing[selectedBarber.tier]
    : null;

  const onConfirm = useCallback(
    ({ clientName, clientPhone }) => {
      mutation.mutate({
        clientName,
        clientPhone,
        barberId: selectedBarber._id,
        serviceId: selectedService._id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
      });
    },
    [mutation, selectedBarber, selectedService, selectedDate, selectedSlot]
  );

  // Date picker helpers
  const today = startOfDay(new Date());
  const dateOptions = Array.from({ length: 30 }, (_, i) => addDays(today, i + 1));

  if (confirmed) {
    return (
      <div className={styles.confirmPage}>
        <div className={styles.confirmCard}>
          <div className={styles.confirmIcon} aria-hidden="true">✓</div>
          <h1 className={styles.confirmTitle}>Booking Confirmed</h1>
          <p className={styles.confirmSub}>
            We'll see you on{' '}
            <strong>{selectedDate && format(selectedDate, 'MMMM d')}</strong> at{' '}
            <strong>{selectedSlot}</strong>
          </p>
          <div className={styles.confirmDetails}>
            <Row label="Service" value={selectedService?.name} />
            <Row label="Barber" value={selectedBarber?.name} />
            <Row label="Total" value={formatPrice(totalPrice)} />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (servicesError || barbersError) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="caption" style={{ textAlign: 'center' }}>
          Unable to load booking data. Please check that the server is running and try again.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Stepper */}
      <nav className={styles.stepper} aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
          >
            <span className={styles.stepNum}>{i < step ? '✓' : i + 1}</span>
            <span className={styles.stepLabel}>{label}</span>
            {i < STEPS.length - 1 && <span className={styles.stepLine} aria-hidden="true" />}
          </div>
        ))}
      </nav>

      <div className={styles.layout}>
        {/* Main panel */}
        <div className={styles.main}>
          {/* Step 0 – Service */}
          {step === 0 && (
            <StepPanel title="Select a Service">
              <div className={styles.cards}>
                {services.map((svc) => (
                  <button
                    key={svc._id}
                    className={`${styles.selectCard} ${selectedService?._id === svc._id ? styles.selected : ''}`}
                    onClick={() => { setSelectedService(svc); setStep(1); }}
                  >
                    <span className="label" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.625rem' }}>
                      {svc.category}
                    </span>
                    <span className={styles.cardTitle}>{svc.name}</span>
                    <span className={styles.cardMeta}>{svc.duration} min &nbsp;·&nbsp; from {formatPrice(svc.pricing.junior)}</span>
                  </button>
                ))}
              </div>
            </StepPanel>
          )}

          {/* Step 1 – Barber */}
          {step === 1 && (
            <StepPanel title="Choose Your Barber" onBack={() => setStep(0)}>
              <div className={styles.cards}>
                {barbers.map((b) => (
                  <button
                    key={b._id}
                    className={`${styles.selectCard} ${selectedBarber?._id === b._id ? styles.selected : ''}`}
                    onClick={() => { setSelectedBarber(b); setStep(2); }}
                  >
                    <div className={styles.barberRow}>
                      <div className={styles.barberAvatar}>{b.name.charAt(0)}</div>
                      <div>
                        <span className={styles.cardTitle}>{b.name}</span>
                        <span className="label" style={{ display: 'block', color: 'var(--color-primary)', fontSize: '0.625rem', marginTop: 2 }}>
                          {b.title}
                        </span>
                      </div>
                    </div>
                    {selectedService && (
                      <span className={styles.tierPrice}>
                        {formatPrice(selectedService.pricing[b.tier])}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </StepPanel>
          )}

          {/* Step 2 – Date & Time */}
          {step === 2 && (
            <StepPanel title="Pick a Date & Time" onBack={() => setStep(1)}>
              <div className={styles.dateGrid}>
                {dateOptions.map((d) => (
                  <button
                    key={d.toISOString()}
                    className={`${styles.dateBtn} ${selectedDate?.getTime() === d.getTime() ? styles.selected : ''}`}
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                  >
                    <span className={styles.dateDow}>{format(d, 'EEE')}</span>
                    <span className={styles.dateDay}>{format(d, 'd')}</span>
                    <span className={styles.dateMon}>{format(d, 'MMM')}</span>
                  </button>
                ))}
              </div>
              {selectedDate && (
                <>
                  <h3 className={styles.slotHeading}>Available Slots</h3>
                  {slots.length === 0 ? (
                    <p className="caption">No slots available for this date.</p>
                  ) : (
                    <div className={styles.slotGrid}>
                      {slots.map((s) => (
                        <button
                          key={s}
                          className={`${styles.slotBtn} ${selectedSlot === s ? styles.selected : ''}`}
                          onClick={() => setSelectedSlot(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--sp-8)' }}
                    disabled={!selectedSlot}
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </button>
                </>
              )}
            </StepPanel>
          )}

          {/* Step 3 – Confirm */}
          {step === 3 && (
            <StepPanel title="Confirm Booking" onBack={() => setStep(2)}>
              <form onSubmit={handleSubmit(onConfirm)} className={styles.confirmForm} noValidate>
                <div className="field">
                  <label htmlFor="clientName">Full Name</label>
                  <input id="clientName" {...register('clientName')} placeholder="Your name" />
                  {errors.clientName && <span className="error-msg">{errors.clientName.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="clientPhone">Phone Number</label>
                  <input id="clientPhone" {...register('clientPhone')} placeholder="+44 7000 000000" />
                  {errors.clientPhone && <span className="error-msg">{errors.clientPhone.message}</span>}
                </div>
                {mutation.isError && (
                  <p className="error-msg" style={{ marginTop: 'var(--sp-4)' }}>
                    {mutation.error?.response?.data?.message || 'Booking failed. Please try again.'}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--sp-6)', width: '100%' }}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Confirming…' : 'Confirm Booking'}
                </button>
              </form>
            </StepPanel>
          )}
        </div>

        {/* Sidebar summary */}
        {(selectedService || selectedBarber) && (
          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Reservation Summary</h3>
            {selectedService && <Row label="Service" value={selectedService.name} />}
            {selectedBarber && <Row label="Barber" value={`${selectedBarber.name} – ${selectedBarber.title}`} />}
            {selectedDate && <Row label="Date" value={format(selectedDate, 'MMMM d, yyyy')} />}
            {selectedSlot && <Row label="Time" value={selectedSlot} />}
            {totalPrice != null && (
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.summaryPrice}>{formatPrice(totalPrice)}</span>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function StepPanel({ title, children, onBack }) {
  return (
    <div>
      <div className={styles.stepHeader}>
        {onBack && (
          <button className={`btn btn-ghost ${styles.backBtn}`} onClick={onBack}>
            ← Back
          </button>
        )}
        <h2 className={styles.stepTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--color-surface-high)' }}>
      <span className="caption">{label}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-on-bg)' }}>{value}</span>
    </div>
  );
}
