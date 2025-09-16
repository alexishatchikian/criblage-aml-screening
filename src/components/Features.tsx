import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Smartphone, Code, Users } from 'lucide-react'

const features = [
  {
    name: 'Lightning Fast',
    description: 'Built with modern tools and optimized for speed. Your users will love the performance.',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    name: 'Secure by Default',
    description: 'Security best practices built-in. Your data and users are protected from day one.',
    icon: Shield,
    color: 'text-green-500',
  },
  {
    name: 'Global Scale',
    description: 'Deploy worldwide with CDN support. Reach users anywhere with minimal latency.',
    icon: Globe,
    color: 'text-blue-500',
  },
  {
    name: 'Mobile First',
    description: 'Responsive design that works perfectly on all devices and screen sizes.',
    icon: Smartphone,
    color: 'text-purple-500',
  },
  {
    name: 'Developer Friendly',
    description: 'Clean, maintainable code with excellent documentation and TypeScript support.',
    icon: Code,
    color: 'text-red-500',
  },
  {
    name: 'Team Collaboration',
    description: 'Built for teams with collaboration tools and shared component libraries.',
    icon: Users,
    color: 'text-indigo-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.h2
            className="text-base text-blue-600 font-semibold tracking-wide uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Features
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Everything you need to succeed
          </motion.p>
          <motion.p
            className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powerful features designed to help you build better products faster.
          </motion.p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="pt-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-white rounded-md shadow-lg">
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}