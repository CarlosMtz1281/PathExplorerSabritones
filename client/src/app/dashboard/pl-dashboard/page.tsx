"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cargabilidad from "@/components/Cargabilidad";


// componente de grafica de cargtabilidad
const SemiCircleChart = ({ percentage }: { percentage: number }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-90 h-50 flex justify-center items-end">
            <svg className="w-full h-full" viewBox="0 0 200 100">
                {/* Background circle */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    strokeLinecap="round"
                />
                {/* Progress circle */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#9605F7"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(90 100 100)"
                />
            </svg>
            <div className="absolute bottom-0 text-center">
                <span className="text-4xl font-bold text-primary">{percentage}%</span>
                <p className="text-lg">Cargabilidad</p>
            </div>
        </div>
    );
};


// Componente de alerta individual
const AlertItem = ({ alerta }: { alerta: any }) => {
    // Determinar color según el tipo de alerta
    const getAlertColor = () => {
      switch(alerta.type) {
        case 'project_feedback':
          return 'bg-accent';
        case 'recent_certification':
          return 'bg-primary';
        case 'registered_goal':
          return 'bg-secondary';
        default:
          return 'bg-primary';
      }
    };
  
    // Formatear el tipo de alerta para mostrar
    const getAlertTypeText = () => {
      switch(alerta.type) {
        case 'project_feedback':
          return 'tiene Feedback nuevo de un proyecto';
        case 'recent_certification':
          return 'completó una nueva Certificación';
        case 'registered_goal':
          return 'registró una nueva Meta';
        default:
          return 'Alerta';
      }
    };

    // Formatear la fecha para mostrar
    const formatDate = (dateString: string | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };
  
    return (
        <div className="py-3">
        <div className="flex items-start">
          {/* Círculo de color */}
          <div className={`w-3 h-3 rounded-full ${getAlertColor()} mr-3 mt-0 flex-shrink-0 self-center`}></div>
          
          {/* Contenido de la alerta */}
          <div className="flex-1">
            <div>
              <span className="font-bold text-base">{alerta.userName || 'Subordinado'}</span>
              <span className="ml-1">{getAlertTypeText()}</span>
            </div>
            {/* Fecha en texto claro */}
            {alerta.date && (
              <div className="text-sm font-light mt-0">
                {formatDate(alerta.date)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
};
  

// Componente de la línea de tiempo de certificaciones
const CertificatesTimeline = ({ data }: { data: any[] }) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentDate = new Date();
    const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - (11 - i));
        return {
            month: date.getMonth(),
            year: date.getFullYear(),
            label: `${months[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`
        };
    });

    const colors = [
        'text-primary', 'text-accent', 'text-secondary',
        'text-green-500', 'text-blue-500', 'text-indigo-500'
    ];

    const maxValue = Math.max(...data.flatMap(user => user.monthlyCounts), 1);
    const chartHeight = 240;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerHeight = chartHeight - margin.top - margin.bottom;
    const monthWidth = 95;

    const yAxisValues = [4, 3, 2, 1, 0];
    const displayMaxValue = 4;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Certificaciones por Mes</h2>
            <div className="w-full h-px bg-base-300 mb-4"></div>

            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="flex items-end">
                        {/* Eje Y */}
                        <div className="relative mr-2" style={{ height: `${chartHeight}px`, width: `${margin.left}px` }}>
                        {yAxisValues.map((value, i) => (
                            <div 
                            key={i} 
                            className="text-xs text-base-content/50 text-right absolute right-0 pr-1"
                            style={{ 
                                top: `${margin.top + innerHeight - ((value / displayMaxValue) * innerHeight)}px`,
                                transform: 'translateY(-50%)',
                                lineHeight: '1rem'
                            }}
                            >
                            {value}
                            </div>
                        ))}
                        </div>

                        {/* Área del gráfico */}
                        <div className="relative" style={{ 
                            height: `${chartHeight}px`, 
                            width: `${last12Months.length * monthWidth}px`
                        }}>
                            {/* Líneas de referencia horizontales */}
                            {yAxisValues.map((value, i) => (
                                <div key={`hline-${i}`} className="absolute w-full border-t border-base-200"
                                    style={{ 
                                        top: `${margin.top + innerHeight - ((value / displayMaxValue) * innerHeight)}px`
                                    }} />
                            ))}

                            {/* Gráfico SVG */}
                            <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
                                {data.map((user, userIdx) => {
                                    const points = last12Months.map((_, monthIdx) => {
                                        const x = margin.left + (monthIdx * monthWidth) + (monthWidth / 2);
                                        // Escalar los valores al rango 0-4
                                        const scaledValue = Math.min(user.monthlyCounts[monthIdx], displayMaxValue);
                                        const y = margin.top + innerHeight - ((scaledValue / displayMaxValue) * innerHeight);
                                        return { x, y };
                                    });

                                    return (
                                        <g key={userIdx}>
                                            {/* Línea */}
                                            <polyline
                                                fill="none"
                                                stroke="currentColor"
                                                className={colors[userIdx % colors.length]}
                                                strokeWidth="2"
                                                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                            />
                                            {/* Puntos */}
                                            {points.map((point, idx) => (
                                                <circle
                                                    key={idx}
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="4"
                                                    fill="currentColor"
                                                    className={colors[userIdx % colors.length]}
                                                />
                                            ))}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    {/* Eje X - Meses */}
                    <div className="flex" style={{ 
                        marginLeft: `${margin.left+50}px`,
                        width: `${last12Months.length * monthWidth}px`
                    }}>
                        {last12Months.map((month, idx) => (
                            <div key={idx} className="text-center" style={{ width: `${monthWidth}px` }}>
                                <div className="text-xs text-base-content/70">
                                    {month.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-4">
                {data.map((user, idx) => (
                    <div key={idx} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length].replace('text', 'bg')} mr-2`} />
                        <span className="text-sm">{user.employeeName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Componente de tarjeta de subordinado
const SubordinadoCard = ({ subordinado }: { subordinado: any }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/profile/${subordinado.id}`);
    };

    return (
        <div 
            className="card bg-base-100 shadow-xl border border-base-300 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >
            {/* Banner */}
            <div className="absolute top-0 left-0 w-full h-32 bg-primary">
                <Image
                    src="/banner.jpg"
                    alt="Banner background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-90"
                />
            </div>
            
            {/* PFP */}
            <div className="relative z-10 flex justify-center">
                <div className="avatar mb-4 mt-16">
                    <div className="w-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <Image
                            width={160}
                            height={160}
                            src="/profilePhoto.jpg"
                            alt={`Foto de ${subordinado.nombre}`}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            </div>
            
            {/* Card content */}
            <div className="card-body items-center text-center p-6 pt-2">
                {/* Nombre */}
                <h3 className="text-2xl font-bold">{subordinado.nombre}</h3>
                
                {/* Puesto */}
                <p className="text-xl mb-4 text-primary">{subordinado.posicion}</p>
                
                {/* Cargabilidad */}
                <Cargabilidad userId={subordinado.id} />
            </div>
        </div>
    );
};



// Componente principal del dashboard
const DashboardPL = () => {
    interface Subordinado {
        id: string;
        nombre: string;
        posicion: string;
        cargabilidad: number;
    }


    const { data: session } = useSession();

    const [cargabilidadProm, setCargabilidadProm] = useState(0);
    const [alertas, setAlertas] = useState([]);
    const [timelineCerts, setTimelineCerts] = useState([]);
    const [subordinados, setSubordinados] = useState([]);
    
    const [dataSubordinados, setDataSubordinados] = useState<Subordinado[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            const sessionId = session?.sessionId;
            if (!sessionId) {
                console.error("Session ID is missing");
                return;
            }

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/pl/dashData`, {
                headers: { "session-key": sessionId },
            });

            if (res.status === 401) {
                console.error("Session expired or invalid. Redirecting to login...");
                localStorage.removeItem("sessionId"); 
                window.location.href = "/login"; 
                return;
              }

            const data = res.data;
            setCargabilidadProm(data.cargabilidadProm);
            setAlertas(data.alertas);
            setTimelineCerts(data.timelineCerts);
            setSubordinados(data.subordinados);
            setDataSubordinados(data.dataSubordinados);
            setLoading(false);

            // console.log("Cargabilidad Prom:", data.cargabilidadProm);
            // console.log("Alertas:", data.alertas);
            // console.log("Timeline Certs:", data.timelineCerts);
            // console.log("Subordinados:", data.subordinados);
            // console.log("Data Subordinados:", data.dataSubordinados);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }
    , []);

  return (
    <div className="flex flex-col h-full bg-base-200 px-22 py-10">
        {/*  Título de la pantalla */}
        <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-6 text-secondary">
            <p>Dashboard (cambiar)</p>
        </div>
        {/* Primeros dashbaords */}
        <div className="flex w-full">
            {/* Carga Prom */}
            <div className="w-2/5 bg-base-100 p-5 rounded-box border border-base-300 mb-6 mr-6">
                <h2 className="text-2xl font-bold mb-4">Cargabilidad Promedio</h2>

                <div className="w-full h-px bg-base-300 mb-2"></div>

                <div className="flex flex-col items-center justify-center pb-8 pt-3">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : (
                        <>
                            <SemiCircleChart percentage={cargabilidadProm} />
                        </>
                    )}
                </div>
            </div>
            {/* Alertas */}
            <div className="flex w-3/5 flex-col bg-base-100 p-5 rounded-md border border-base-300 mb-6">
                <h2 className="text-2xl font-bold mb-4">Alertas Recientes</h2>
                
                <div className="w-full h-px bg-base-300 mb-2"></div>
                
                <div className="overflow-y-auto max-h-64 pr-2">
                    {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                    ) : (
                    <div className="space-y-0">
                        {alertas.map((alerta, index) => (
                        <div key={index}>
                            <AlertItem alerta={alerta} />
                            {/* Custom divider - only shows between items */}
                            {index < alertas.length - 1 && (
                            <div className="w-[80%] h-px bg-base-300 mt-0.5"></div>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            </div>
        </div>

        {/* Timeline de certs */}
        <div className="flex w-full bg-base-100 p-5 rounded-md border border-base-300 mb-6">
            {loading ? (
                <div className="flex justify-center items-center w-full h-40">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <CertificatesTimeline data={timelineCerts} />
            )}
        </div>

        {/* Subordinados */}
        <div className="w-full mb-10 mt-4">
            <div className="flex w-full items-center bg-base-100 p-5 text-3xl font-bold rounded-md border border-base-300 mb-8 mt-2 text-secondary">
                <p>Tus Subordinados</p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-28">
                    {dataSubordinados.map((subordinado) => (
                        <SubordinadoCard 
                            key={subordinado.id} 
                            subordinado={subordinado} 
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default DashboardPL;