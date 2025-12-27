import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const HelpPage: React.FC = () => {
  const handleEmailContact = () => {
    window.location.href = 'mailto:fsteven320@gmail.com?subject=Soporte Técnico - Aplicación Web';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ayuda y Soporte</h1>
          <p className="text-muted-foreground">
            Encuentra respuestas a tus preguntas y obtén ayuda con la aplicación.
          </p>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" size={24} />
              Preguntas Frecuentes
            </CardTitle>
            <CardDescription>
              Respuestas a las preguntas más comunes sobre el uso de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-foreground mb-2">¿Cómo subir archivos?</h3>
              <p className="text-sm text-muted-foreground">
                Ve a la sección "Subir Archivos" en el menú lateral, selecciona tus archivos y haz clic en "Subir".
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-foreground mb-2">¿Cómo cambiar mi avatar?</h3>
              <p className="text-sm text-muted-foreground">
                Ve a tu perfil, haz clic en la imagen de avatar actual y selecciona una nueva imagen.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-foreground mb-2">¿Cómo gestionar permisos?</h3>
              <p className="text-sm text-muted-foreground">
                Los administradores pueden acceder a "Gestión de Permisos" desde el menú lateral para administrar roles de usuario.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">¿Necesitas más ayuda?</h3>
              <p className="text-sm text-muted-foreground">
                Si no encuentras la respuesta que buscas, contacta con el soporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Mail" size={24} />
              Contactar con Soporte
            </CardTitle>
            <CardDescription>
              ¿Tienes un problema o necesitas asistencia? Ponte en contacto con el programador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Para soporte técnico, reportes de errores o sugerencias, envía un correo electrónico al programador:
                </p>
                <p className="font-medium text-foreground">fsteven320@gmail.com</p>
              </div>
              <Button
                onClick={handleEmailContact}
                className="flex items-center gap-2"
                iconName="Mail"
              >
                Enviar Correo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={24} />
              Solución de Problemas
            </CardTitle>
            <CardDescription>
              Consejos para resolver problemas comunes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-foreground mb-2">Error al subir avatar</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Asegúrate de que la imagen sea menor a 5MB</li>
                <li>Formatos soportados: JPG, PNG, GIF</li>
                <li>Verifica tu conexión a internet</li>
                <li>Intenta recargar la página y volver a intentarlo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Problemas de carga de archivos</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Verifica el tamaño máximo permitido (generalmente 10MB por archivo)</li>
                <li>Asegúrate de que el archivo no esté corrupto</li>
                <li>Comprueba que tengas permisos para subir archivos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
